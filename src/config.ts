const Package = require('../package.json');
require('dotenv').load({ silent: true });

const {
  NAME = 'feedbackfruits-knowledge-search-broker',
  CAYLEY_ADDRESS = 'http://localhost:64210',
  KNOWLEDGE_ADDRESS = 'https://staging-api.explain.direct',
  KAFKA_ADDRESS = 'tcp://localhost:9092',
  INPUT_TOPIC = 'staging_updates',
  ELASTICSEARCH_ADDRESS = 'http://localhost:9200',
  ELASTICSEARCH_INDEX_NAME = 'knowledge',
  VERSION = Package.version
} = process.env;

const INDEX_BATCH_SIZE = parseInt(process.env.INDEX_BATCH_SIZE ? process.env.INDEX_BATCH_SIZE : '100');

export {
  NAME,
  ELASTICSEARCH_ADDRESS,
  CAYLEY_ADDRESS,
  KNOWLEDGE_ADDRESS,
  KAFKA_ADDRESS,
  INPUT_TOPIC,
  ELASTICSEARCH_INDEX_NAME,
  INDEX_BATCH_SIZE,
  VERSION
};
