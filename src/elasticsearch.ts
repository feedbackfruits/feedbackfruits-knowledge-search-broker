import elasticsearch = require('elasticsearch');

import { Doc } from 'feedbackfruits-knowledge-engine';

import * as Config from './config';
import * as Helpers from './helpers';

const {
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME,
} = Config;

import indices from './indices';

let awaitingCreation = null;
export async function ensureIndices() {
  const exists = await indicesExist();
  if (!exists && !awaitingCreation) awaitingCreation = createIndices();
  await awaitingCreation;
  return true;
}

export function createIndices() {
  console.log(`Creating indices...`);
  return Promise.all(Object.keys(indices).map(indexName => {
    return new Promise((resolve, reject) => {
      // console.log('Sending mapping:', mapping);
      const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
      const index = indices[indexName];

      client.indices.create({ index: name, body: index }, (res, data) => {
        if ('error' in data) return reject(data.error);
        console.log(`Index ${indexName} created as ${name}.`);
        return resolve(data);
      });
    });
  }));

}

export async function indicesExist() {
  return (await Promise.all(Object.keys(indices).map(indexName => {
    return new Promise((resolve, reject) => {
      const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
      client.indices.exists({ index: name }, (res, data) => {
        console.log(`Testing index existence for ${indexName} as ${name}:`, data);
        return resolve(data);
      });
    })
  }))).reduce((memo, exists) => memo && exists, true);
}

let i = 0;
export function index(docs: Array<{ index: string, doc: Doc, parent: string | null }>): Promise<void> {
  if (docs.length === 0) return Promise.resolve();
  console.log(`Indexing: ${i++}, docs length ${docs.length}.`);

  return new Promise((resolve, reject) => {
      client.bulk({
        body: docs.map(({ index: indexName, doc, parent }) => {
          const id = doc["@id"];
          const type = Helpers.typeFor([].concat(doc["@type"]));
          const parentType = Helpers.parentTypeForType(indexName, type);
          const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;

          console.log(`Indexing to ${indexName} as ${name} ${type} ${id} <-- ${parent} of type ${parentType}`);
          return [
            {
              update: {
                _index: name,
                _id: id,
                _type: type,
                _retry_on_conflict: 3,
                ...((parentType && parent) ? { parent } : {})
              }
            },
            { doc, doc_as_upsert: true }
          ];
        }).reduce((memo, x) => memo.concat(x), [])
      }, (err, res) => {
        if (err) return reject(err);
        if (res['errors'] === true) {
          return reject(new Error(JSON.stringify(res)));
        }
        console.log('Indexing succesfull!');
        return resolve(res);
      });
  });
}

export const client = new elasticsearch.Client({
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: '5.x'
});

export default client;
