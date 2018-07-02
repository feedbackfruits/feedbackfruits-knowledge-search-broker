const Config = require('./lib/config');
const ElasticSearch = require('./lib/elasticsearch');

exports.migrate = async function(client, done) {
	// Create new indices based on version
	await ElasticSearch.createIndices();

	// Switch indexing aliases
	await ElasticSearch.updateIndexingAliases();

	// Execute reindex operation in the background
	await ElasticSearch.reindexFromSearchAlias();

	// Update search aliases
	await ElasticSearch.updateSearchAliases();

	done();
};

exports.rollback = function(client, done) {
	// done();
};
