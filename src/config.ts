require('dotenv').load({ silent: true });

const {
  NAME = 'feedbackfruits-knowledge-search-broker-v25',
  ELASTICSEARCH_ADDRESS = 'http://localhost:9200',
  GIZMO_ENDPONT = 'http://staging-fbf-cayley.herokuapp.com/api/v1/query/gizmo',
  KNOWLEDGE_ADDRESS = 'https://staging-api.explain.direct',
  KAFKA_ADDRESS = 'tcp://kafka:9092',
  INPUT_TOPIC = 'staging_quad_updates',
  ELASTICSEARCH_INDEX_NAME = 'knowledge',
} = process.env;

export {
  NAME,
  ELASTICSEARCH_ADDRESS,
  GIZMO_ENDPONT,
  KNOWLEDGE_ADDRESS,
  KAFKA_ADDRESS,
  INPUT_TOPIC,
  ELASTICSEARCH_INDEX_NAME,
};
