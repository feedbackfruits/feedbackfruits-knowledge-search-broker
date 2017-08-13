import elasticsearch = require('elasticsearch');

import * as Config from './config';

const {
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME,
} = Config;

import mapping from './mapping';

export function createIndex() {
  console.log(`Creating index...`);
  return new Promise((resolve, reject) => {
    client.indices.create({ index: ELASTICSEARCH_INDEX_NAME, body: mapping }, (res, data) => {
      if ('error' in data) return reject(data.error);
      console.log(`Index created.`);
      return resolve(data);
    });
  });
}

export function indexExists() {
  return new Promise((resolve, reject) => {
    client.indices.exists({ index: ELASTICSEARCH_INDEX_NAME }, (res, data) => {
      return resolve(data);
    });
  })
}

let i = 0;
export function index(type, docs): Promise<void> {
  if (docs.length === 0) return Promise.resolve();
  console.log(`Indexing: ${i++}, docs length ${docs.length}.`);

  return new Promise((resolve, reject) => {
      client.bulk({
        body: docs.map(doc => {
          let { id } = doc;
          return [
            { index: { _index: ELASTICSEARCH_INDEX_NAME, _type: type, _id: id } },
            doc
          ];
        }).reduce((memo, x) => memo.concat(x), [])
      }, (err, res) => {
        // console.log('ElasticSearch response:', err, JSON.stringify(res));
        if (err) return reject(err);
        if (res['errors'] === true) {
          return reject(new Error(JSON.stringify(res.items.map(item => item.index.error).filter(x => x).map(x => x.reason))));
        }
        return resolve(res);
      });
  });
}

export const client = new elasticsearch.Client({
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: '5.x'
});

export default client;
