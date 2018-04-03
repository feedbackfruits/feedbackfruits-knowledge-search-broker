import { Operation } from 'memux';
import { Doc, Broker, Config as _Config, Context } from 'feedbackfruits-knowledge-engine';
import * as Config from './config';

import * as Helpers from './helpers';
import * as ElasticSearch from './elasticsearch';

// async function broker(doc: Doc) {
//   console.log('Indexing:', doc["@id"]);
//   return ElasticSearch.index([ doc ]);
//   // console.log(`Brokering ${doc['@id']}`);
//   // if (isEntityDoc(doc)) {
//   //   const entity = await docToEntity(doc);
//   //   console.log('Indexing:', entity);
//   //   return ElasticSearch.index([ entity ]);
//   // } else if (isResourceDoc(doc)) {
//   //   const resource = docToResource(doc);
//   //   console.log('Indexing:', resource);
//   //   return ElasticSearch.index([ resource ]);
//   // } else {
//   //   throw new Error(`Doc ${doc['@id']} can not be brokered.`);
//   // }
// }

export default async function init({ name }) {
  const exists = await ElasticSearch.ensureIndex()
  if (!exists) await ElasticSearch.createIndex();

  const receive = async (operation: Operation<Doc>) => {
    console.log('Received operation:', operation);
    const { action, data: doc } = operation;
    if (action !== 'write') return;
    const flattenedWithParents = await Helpers.flattenDocWithParents(doc);
    const filtered = flattenedWithParents.filter(({ doc }) => {
      return Helpers.isOperableDoc(doc);
    });

    return ElasticSearch.index(filtered);
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
