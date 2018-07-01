const Package = require('../package.json');
const _getVersion = require('git-repo-version');
require('dotenv').load({ silent: true });

const {
  NODE_ENV = 'development',
  NAME = 'feedbackfruits-knowledge-search-broker',
  CAYLEY_ADDRESS = 'http://localhost:64210',
  KNOWLEDGE_ADDRESS = 'https://staging-api.explain.direct',
  KAFKA_ADDRESS = 'tcp://localhost:9092',
  INPUT_TOPIC = 'staging_updates',
  ELASTICSEARCH_ADDRESS = 'http://localhost:9200',
  ELASTICSEARCH_INDEX_NAME = 'knowledge',
  ELASTICSEARCH_USE_ALIASES = false
} = process.env;

function getVersion() {
  if (NODE_ENV === 'production') return Package.version;
  if (NODE_ENV === 'test') return `test--${_getVersion().replace('+', '-')}`;
  if (NODE_ENV === 'development') return _getVersion().replace('+', '-');
  if (NODE_ENV !== 'staging') throw new Error(`Invalid NODE_ENV: ${NODE_ENV}`);

  const slug = process.env.HEROKU_SLUG_COMMIT || "";
  if (slug.length === 0) throw new Error('HEROKU_SLUG_COMMIT not set.');
  const hash = slug.length ? slug.slice(0, 5) : "unknown-hash";
  return `${Package.version}+${hash}`;
}

const VERSION = getVersion();
const INDEX_BATCH_SIZE = parseInt(process.env.INDEX_BATCH_SIZE ? process.env.INDEX_BATCH_SIZE : '100');

export {
  NAME,
  ELASTICSEARCH_ADDRESS,
  CAYLEY_ADDRESS,
  KNOWLEDGE_ADDRESS,
  KAFKA_ADDRESS,
  INPUT_TOPIC,
  ELASTICSEARCH_INDEX_NAME,
  ELASTICSEARCH_USE_ALIASES,
  INDEX_BATCH_SIZE,
  VERSION
};
