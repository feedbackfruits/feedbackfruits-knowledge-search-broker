require('dotenv').load({ silent: true });

const {
  NAME = 'feedbackfruits-knowledge-search-broker-v12',
  ELASTICSEARCH_ADRESS = 'http://localhost:9200',
  KNOWLEDGE_ADDRESS = 'http://localhost:4000',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'quad_updates',
  INDEX_NAME = 'knowledge-v4',
} = process.env;

const memux = require('memux');
const { Observable: { empty } } = require('rxjs');

const PQueue = require('p-queue');
const pThrottle = require('p-throttle')
const pDebounce = require('p-debounce');

const elasticsearch = require('elasticsearch');
const fetch = require('node-fetch');

const client = new elasticsearch.Client( {
  host: ELASTICSEARCH_ADRESS,
  apiVersion: '2.4'
});


const { source, sink, send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  input: INPUT_TOPIC,
});

const queue = new PQueue({
  concurrency: 100
});

const regex = /<http:\/\/academic.microsoft.com\/#\/detail\/\d+>/;

let i = 0;

function index(type, docs) {
  if (docs.length === 0) return Promise.resolve();
  console.log(`Indexing: ${i++}, docs length ${docs.length}.`);
  // console.log('ASDaSADASDASD', type, doc);
  return client.bulk({
    body: docs.map(doc => {
      let { id } = doc;
      return [
        { index: { _index: INDEX_NAME, _type: type, _id: id } },
        doc
      ];
    }).reduce((memo, x) => memo.concat(x), [])
  });
}

const fetchers = {};

const deirify = iri => iri.slice(1, iri.length-1)

source.flatMap(({ action: { type, quad: { subject, object } }, progress }) => {
  console.log(subject, object);
  return queue.add(() => {
    if (!subject.match(regex) && !object.match(regex)) return Promise.resolve();
    return Promise.all([subject, object].filter(regex.test.bind(regex)).map(id => {
      const fetcher = id in fetchers ? fetchers[id] : (fetchers[id] = pDebounce(makeFetcher(id), 2000)); //.then((res) => { delete fetchers[id]; return res; })
      return fetcher();
    })).then(docss => docss.reduce((memo, docs) => memo.concat(docs), [])).then(index.bind(undefined, 'fieldOfStudy'));
  }).then(() => progress)
}).subscribe(sink);

const makeFetcher = id => () => {
  if (id in fetchers) return fetchers[id];
  return fetchers[id] = fetch(`${KNOWLEDGE_ADDRESS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `query {
        fieldOfStudy(id: "${deirify(id)}") {
          id,
          name
        }
      }`
    })
  }).then(response => response.json()).then(({data: { fieldOfStudy }}) => {
    delete fetchers[id];
    return fieldOfStudy;
  });
}

// require('dotenv').load({ silent: true });
// const {
//   NAME = 'feedbackfruits-knowledge-search-broker',
//
//   ELASTICSEARCH_ADRESS = 'http://localhost:9200',
//   INDEX_NAME = 'knowledge',
//
//   KAFKA_ADDRESS = 'tcp://kafka:9092',
//   INPUT_TOPIC = 'quad_update_requests',
//   OUTPUT_TOPIC = 'quad_updates',
// } = process.env;
//
// const elasticsearch = require('elasticsearch');
// const memux = require('memux');
// const { Observable: { empty } } = require('rxjs');
// const PQueue = require('p-queue');
//

// const { source, sink, send } = memux({
//   name: NAME,
//   url: KAFKA_ADDRESS,
//   input: INPUT_TOPIC,
//   output: OUTPUT_TOPIC
// });
//
// const queue = new PQueue({
//   concurrency: 32
// });
//
// const onError = (error) => console.error(error);
//
// function index(type, doc) {
//   let { id } = doc;
//   return client.index({
//     index: INDEX_NAME,
//     id: id,
//     type,
//     body: doc
//   });
// }
//
// const regex = /<https:\/\/academic.microsoft.com\/#\/detail\/\d+>/;
//
// function getTopic(subject) {
//   if (!subject.match(regex)) return null;
//
// }
//
// function mapTopic(topic) {
//   return topic;
// }
//
// source.flatMap(({ action: { type, quad }, progress }) => {
//   return queue.add(async () => {
//     let { subject } = quad;
//     let topic = await getTopic(subject);
//     if (topic != null) {
//       return index('topic', mapTopic(topic));
//     }
//   }).then(() => progress);
// }).subscribe(sink, onError);
