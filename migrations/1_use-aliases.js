const Config = require('../lib/config');
const ElasticSearch = require('../lib/elasticsearch');

const indices = [ "resources", "autocomplete" ];
const POLL_INTERVAL = 5000;

async function indicesExist() {
	const names = indices
	.map(indexName => [ `${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}` ])
	.reduce((memo, val) => [].concat(memo, val));

	return new Promise((resolve, reject) => {
		ElasticSearch.client.indices.exists({ index: names }, (err, data) => {
			if (err) return reject(err);
			console.log(`Testing index existence for ${names}:`, data);
			return resolve(data);
		});
	})
}

async function reindex() {
	return Promise.all(indices.map(async indexName => {
		const task = await new Promise((resolve, reject) => {
			const aliasName = `${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}`;
			const name = `${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}_index`;
			console.log(`Starting reindex from ${aliasName} to ${name}...`);
			const params = {
				waitForCompletion: false,
				refresh: true, // Refresh index once done
				body: {
					conflicts: "proceed", // Don't break the job if one document breaks on reindexing
					source: {
						index: aliasName
					},
					dest: {
						index: name,
						version_type: "internal", // Don't care about the version of the stale doc
						op_type: "create", // The reindexed data is stale, so no need to update anything, just creating missing data is fine
					},
					script: {
						inline: "if (ctx._source.encoding instanceof Object) {ctx._source.encoding = [ ctx._source.encoding.id ]}",
						lang: "painless"
					}
				}
			};

			ElasticSearch.client.reindex(params, (err, res) => {
				if (err) return reject(err);
				return resolve(res);
			});
		});

		return taskFinished(task);
	}));
}

async function taskFinished(task) {
	const exists = await new Promise((resolve, reject) => {
		console.log(`Checking existence of task:`, task);
			const params = {
				taskId: task.task
			};

			ElasticSearch.client.tasks.get(params, (err, res) => {
				if (err) {
					console.log('Encountered error looking for task. Assuming task finished.');
					console.error(err);
					return resolve(false);
				}
				return resolve(true);
			});
	});

	if (!exists) return true;
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(taskFinished(task));
		}, POLL_INTERVAL);
	})
}

exports.migrate = async function(client, done) {
	try {
		const exists = await indicesExist();
		if (!exists) {
			console.log('No migration needed. Creating indices and aliases...');
			// Create new indices based on version
			await ElasticSearch.createIndices();

			await ElasticSearch.updateIndexingAliases();
			await ElasticSearch.updateSearchAliases();

			return done();
		}

		// Create new indices based on version
		await ElasticSearch.createIndices();

		// Switch indexing aliases
		await ElasticSearch.updateIndexingAliases();

		// Execute reindex operation in the background
		await reindex();

		// Update search aliases
		await ElasticSearch.updateSearchAliases();

		done();
	} catch(e) {
		console.error(e);
		throw e;
	}
};

exports.rollback = function(client, done) {
	done();
};
