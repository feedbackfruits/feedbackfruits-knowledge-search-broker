import { Operation } from 'memux';
import { Doc, Broker, Config as _Config, Context } from 'feedbackfruits-knowledge-engine';
import * as Config from './config';

import * as Helpers from './helpers';
import * as ElasticSearch from './elasticsearch';
import indices from './indices';

function parentForDoc(doc: Doc) {
  const types = [].concat(doc["@type"]);
  const typeMap = types.reduce((memo, type) => ({ ...memo, [type]: true }), {});

  if ('Tag' in typeMap || 'Annotation' in typeMap) {
    return doc["tagOf"];
  }

  return null;
}

export default async function init({ name }) {
  const receive = async (operation: Operation<Doc>) => {
    console.log('Received operation:', operation);
    const { action, data: doc } = operation;
    if (action !== 'write') return;

    await Promise.all(Object.keys(indices).map(async indexName => {
      const index = indices[indexName];
      const frames = [].concat(index.frames || index.frame || []);

      await Promise.all(frames.map(async (_frame) => {
        const frame = { "@context": Context.context, ..._frame };
        // The framing serves two purposes: 1) check if doc is usable for index and 2) turn graph into list of trees
        const framed = await Doc.frame([ doc ], frame);
        if (framed.length === 0) return; // Empty output ==> input 'rejected' by frame, not usable for this index

        // Process all the trees
        return Promise.all(framed.map(async tree => {
          const compacted = await Doc.compact(tree, Context.context);
          // const flattenedWithParents = await Helpers.flattenDocWithParents(tree);
          if (!index.isOperableDoc(compacted)) return;
          const parent = parentForDoc(compacted);
          console.log(`Proceeding with index:`, compacted["@id"], "with parent", parent)
          const mapped = await index.mapDoc(compacted);

          console.log('Mapped doc:', mapped);

          await ElasticSearch.index([ { doc: mapped, parent, index: indexName } ])
          // const filtered = flattenedWithParents.filter(({ doc }) => {
          //   return index.isOperableDoc(doc);
          // });

          // return ElasticSearch.index(filtered.map(x => ({ ...x, index: indexName })));
        }));
      }));
    }));

    // const compacted = await Doc.compact(doc, Context.context);
    // const flattened = await Doc.flatten(compacted, Context.context);
    //
    // await Promise.all(flattened.map(async (doc) => {
    //   if (!Helpers.isOperableDoc(doc)) return;
    //   // console.log('Indexing:', doc);
    //   return ElasticSearch.index([ doc ]);
    // }));
  }

  return await Broker({
    name,
    receive,
    customConfig: Config as any as typeof _Config.Base
  });
}

// Start the server when executed directly
declare const require: any;
if (require.main === module) {
  console.log("Running as script.");
  init({
    name: Config.NAME,
  }).catch((e) => {
    console.error(e);
    throw e;
  });
}
