require('dotenv').load({ silent: true });

const {
  NAME = 'feedbackfruits-knowledge-search-broker-v21',
  ELASTICSEARCH_ADDRESS = 'http://localhost:9200',
  KNOWLEDGE_ADDRESS = 'http://localhost:4000',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'quad_updates',
  ELASTICSEARCH_INDEX_NAME = 'knowledge',
} = process.env;

const memux = require('memux');
const { Observable: { empty } } = require('rxjs');

const PQueue = require('p-queue');
const PMap = require('p-map');
const pThrottle = require('p-throttle')
const pDebounce = require('p-debounce');

const elasticsearch = require('elasticsearch');
const fetch = require('node-fetch');

const client = new elasticsearch.Client( {
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: '5.x'
});

const { source, sink, send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  input: INPUT_TOPIC,
});

const queue = new PQueue({
  concurrency: 100
});

const regex = /<http:\/\/dbpedia\.org\/resource\/(\w+)>/;

let i = 0;

const deirify = iri => iri.slice(1, iri.length-1)

function dedup(arr) {
  return Object.keys(arr.reduce((memo, value) => {
    memo[value] = true;
    return memo;
  }, {}));
}

const mapping = {
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
            }
         }
      }
   }
};

function createIndex() {
  console.log(`Creating index...`);
  return new Promise((resolve, reject) => {
    client.indices.create({ index: ELASTICSEARCH_INDEX_NAME, body: mapping }, (res, data) => {
      if ('error' in data) return reject(data.error);
      console.log(`Index created.`);
      return resolve(data);
    });
  });
}

function indexExists() {
  return new Promise((resolve, reject) => {
    client.indices.exists({ index: ELASTICSEARCH_INDEX_NAME }, (res, data) => {
      return resolve(data);
    });
  })
}

function index(type, docs) {
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
      if (res['errors'] === true) return reject(res);
      return resolve(res);
    });
  });
}

function fetchDocs(ids) {
  console.log(`Fetching docs, ids length ${ids.length}.`);
  return fetch(`${KNOWLEDGE_ADDRESS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `query {
        entities(id: ${JSON.stringify(ids.map(id => deirify(id)))}, first: ${ids.length}) {
          id,
          name
        }
      }`
    })
  }).then(response => response.json()).then((res) => {
    let { data: { entities } } = res;
    return entities && entities.length && entities[0] ? entities : [];
  });
}

function mapAction({ action: { type, quad: { subject, object } }, progress }) {
  if (!subject.match(regex) && !object.match(regex)) return [];
  return [subject, object].filter(regex.test.bind(regex));
}

function doThings() {
  return indexExists().then(exists => {
    if (!exists) return createIndex();
  }).then(() => {
    source.bufferCount(100).flatMap((actions) => {
      let { progress } = actions[actions.length - 1];
      return queue.add(() => {
        let ids = dedup(actions.map(mapAction).reduce((memo, x) => memo.concat(x), []));

        if (ids.length === 0) return Promise.resolve();
        return fetchDocs(ids).then(index.bind(undefined, 'entity'));
      }).then(() => progress);
    }).subscribe(sink);
  });
}

doThings().catch(err => console.error(err));
