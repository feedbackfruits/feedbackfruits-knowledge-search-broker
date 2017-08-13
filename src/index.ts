require('dotenv').load({ silent: true });

const {
  NAME = 'feedbackfruits-knowledge-search-broker-v26',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'staging_quad_updates',
} = process.env;

import memux = require('memux');
import PQueue = require('p-queue');

import * as ElasticSearch from './elasticsearch';
import * as Entity from './entity';

const { source, sink, send } = memux({
  name: NAME,
  url: KAFKA_ADDRESS,
  input: INPUT_TOPIC,
});

const queue = new PQueue({
  concurrency: 50
});

async function doThings() {
  const exists = await ElasticSearch.indexExists()
  if (!exists) await ElasticSearch.createIndex();

  return source.bufferCount(100).flatMap((actions) => {
    let { progress } = actions[actions.length - 1];
    return queue.add(() => {
      return Entity.handleActions(actions);
    }).then(() => progress);
  }).subscribe(sink);

}

doThings().catch(err => console.error(err));
