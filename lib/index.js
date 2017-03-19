function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

require('dotenv').load({ silent: true });
const {
  NAME = 'feedbackfruits-knowledge-search-broker',

  ELASTICSEARCH_ADRESS = 'http://localhost:9200',
  INDEX_NAME = 'knowledge',

  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'quad_update_requests',
  OUTPUT_TOPIC = 'quad_updates'
} = process.env;

const elasticsearch = require('elasticsearch');
const memux = require('memux');
const { Observable: { empty } } = require('rxjs');
const PQueue = require('p-queue');

const client = new elasticsearch.Client({
  host: ELASTICSEARCH_ADRESS,
  apiVersion: '2.4'
});

const { source, sink, send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  input: INPUT_TOPIC,
  output: OUTPUT_TOPIC
});

const queue = new PQueue({
  concurrency: 32
});

const onError = error => console.error(error);

function index(type, doc) {
  let { id } = doc;
  return client.index({
    index: INDEX_NAME,
    id: id,
    type,
    body: doc
  });
}

const regex = /<https:\/\/academic.microsoft.com\/#\/detail\/\d+>/;

function getTopic(subject) {
  if (!subject.match(regex)) return null;
}

function mapTopic(topic) {
  return topic;
}

source.flatMap(({ action: { type, quad }, progress }) => {
  return queue.add(_asyncToGenerator(function* () {
    let { subject } = quad;
    let topic = yield getTopic(subject);
    if (topic != null) {
      return index('topic', mapTopic(topic));
    }
  })).then(() => progress);
}).subscribe(sink, onError);