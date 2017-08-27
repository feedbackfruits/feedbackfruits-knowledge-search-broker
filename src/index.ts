import { Operation } from 'memux';
import { Doc, Broker, Config as _Config } from 'feedbackfruits-knowledge-engine';
import * as Config from './config';

import { isOperableDoc, isEntityDoc, isResourceDoc, docToResource, docToEntity } from './helpers';
import * as ElasticSearch from './elasticsearch';

async function broker(doc: Doc) {
  console.log(`Brokering ${doc['@id']}`);
  if (isEntityDoc(doc)) {
    const entity = await docToEntity(doc);
    console.log('Indexing:', entity);
    return ElasticSearch.index('entity', [ entity ]);
  } else if (isResourceDoc(doc)) {
    const resource = docToResource(doc);
    console.log('Indexing:', resource);
    return ElasticSearch.index('resource', [ resource ]);
  } else {
    throw new Error(`Doc ${doc['@id']} can not be brokered.`);
  }
}

export default async function init({ name }) {
  const exists = await ElasticSearch.ensureIndex()
  if (!exists) await ElasticSearch.createIndex();

  const receive = async (operation: Operation<Doc>) => {
    console.log('Received operation:', operation);
    const { action, data: doc } = operation;
    if (!(action === 'write') || !isOperableDoc(doc)) return;

    return broker(doc);
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
