require('dotenv').load({ silent: true });

const {
  NAME = 'feedbackfruits-knowledge-search-broker',
  ELASTICSEARCH_ADDRESS = 'http://localhost:9200',
  CAYLEY_ADDRESS = 'http://cayley:64210',
  KNOWLEDGE_ADDRESS = 'https://staging-api.explain.direct',
  KAFKA_ADDRESS = 'tcp://localhost:9092',
  INPUT_TOPIC = 'staging_updates',
  ELASTICSEARCH_INDEX_NAME = 'knowledge',
} = process.env;

export {
  NAME,
  ELASTICSEARCH_ADDRESS,
  CAYLEY_ADDRESS,
  KNOWLEDGE_ADDRESS,
  KAFKA_ADDRESS,
  INPUT_TOPIC,
  ELASTICSEARCH_INDEX_NAME,
};
