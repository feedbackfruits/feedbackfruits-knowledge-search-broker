import * as Config from './config';
import * as ElasticSearch from './elasticsearch';

export const POLL_INTERVAL = 5000;

export async function migrate(scriptPerIndex: { [key: string]: string }) {
  const indices = Object.keys(scriptPerIndex);
  const versionedExist = await versionedIndicesExist(indices);
  if (!versionedExist) {
    // Create new indices based on version
    await ElasticSearch.createIndices();

    await ElasticSearch.updateIndexingAliases();

    await Promise.all(indices.map(async indexName => {
      // Execute reindex operation in the background
      const script = scriptPerIndex[indexName];
      if (script == null) return;
      await reindex("resources", script);
    }));

    // Update search aliases
    await ElasticSearch.updateSearchAliases();
  }
};


export async function indicesExist(indices: string[]) {
	const names = indices
	.map(indexName => [ `${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}` ])
	.reduce((memo, val) => [].concat(memo, val), []);

	return new Promise((resolve, reject) => {
		ElasticSearch.client.indices.exists({ index: names }, (err, data) => {
			if (err) return reject(err);
			console.log(`Testing index existence for ${names}:`, data);
			return resolve(data);
		});
	})
}

export async function versionedIndicesExist(indices: string[]) {
	const names = indices
	.map(indexName => [ `${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}-${Config.VERSION}` ])
	.reduce((memo, val) => [].concat(memo, val));

	return new Promise((resolve, reject) => {
		ElasticSearch.client.indices.exists({ index: names }, (err, data) => {
			if (err) return reject(err);
			console.log(`Testing index existence for ${names}:`, data);
			return resolve(data);
		});
	})
}

export async function reindex(indexName: string, script: string) {
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
        inline: script,
        lang: "painless"
      }
    }
  };

	const task = await new Promise((resolve, reject) => {
		ElasticSearch.client.reindex(params, (err, res) => {
			if (err) return reject(err);
			return resolve(res);
		});
	});

	return taskFinished(task);
}

export async function taskFinished(task) {
	const completed = await new Promise((resolve, reject) => {
		console.log(`Checking existence of task:`, task);
			const params = {
				taskId: task.task
			};

			ElasticSearch.client.tasks.get(params, (err, res) => {
				if (err) return reject(err);
				console.log('Got task data, returning task comletion status...');
				return resolve(res.completed);
			});
	});

	if (completed) return true;
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve(taskFinished(task));
		}, POLL_INTERVAL);
	})
}
