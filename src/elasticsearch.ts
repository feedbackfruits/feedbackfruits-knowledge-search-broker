import elasticsearch = require('elasticsearch');

import * as Config from './config';

const {
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME,
} = Config;

export const mapping = {
   "settings": {
      "analysis": {
         "filter": {
            "edge_ngram_filter": {
               "type": "edge_ngram",
               "min_gram": 2,
               "max_gram": 20
            }
         },
         "analyzer": {
            "edge_ngram_analyzer": {
               "type": "custom",
               "tokenizer": "standard",
               "filter": [
                  "lowercase",
                  "edge_ngram_filter"
               ]
            }
         }
      }
   },
   "mappings": {
      "entity": {
         "properties": {
            "name": {
               "type": "text",
               "analyzer": "edge_ngram_analyzer",
               "search_analyzer": "english"
            },
            "count": {
              "type": "integer"
            }
         }
      }
   }
};

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
export function index(type, docs) {
  if (docs.length === 0) return Promise.resolve();
  console.log(`Indexing: ${i++}, docs length ${docs.length}.`);

  return new Promise((resolve, reject) => {
      client.bulk({
        body: docs.map(doc => {
          let { id, name } = doc;
          return [
            { index: { _index: ELASTICSEARCH_INDEX_NAME, _type: type, _id: id } },
            doc
          ];
        }).reduce((memo, x) => memo.concat(x), [])
      }, (err, res) => {
        if (err) return reject(err);
        if (res['errors'] === true) {
          return reject(res.map(item => item.index.error).filter(x => x).map(x => x.reason));
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
