"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config = require("./config");
const ElasticSearch = require("./elasticsearch");
exports.POLL_INTERVAL = 5000;
async function migrate(scriptPerIndex) {
    const indices = Object.keys(scriptPerIndex);
    const exists = await indicesExist(indices);
    const versionedExist = await versionedIndicesExist(indices);
    if (!versionedExist) {
        await ElasticSearch.createIndices();
        await ElasticSearch.updateIndexingAliases();
    }
    if (exists) {
        await Promise.all(indices.map(async (indexName) => {
            const script = scriptPerIndex[indexName];
            await reindex("resources", script);
        }));
    }
    if (!versionedExist) {
        await ElasticSearch.updateSearchAliases();
    }
}
exports.migrate = migrate;
;
async function indicesExist(indices) {
    const names = indices
        .map(indexName => [`${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}`])
        .reduce((memo, val) => [].concat(memo, val));
    return new Promise((resolve, reject) => {
        ElasticSearch.client.indices.exists({ index: names }, (err, data) => {
            if (err)
                return reject(err);
            console.log(`Testing index existence for ${names}:`, data);
            return resolve(data);
        });
    });
}
exports.indicesExist = indicesExist;
async function versionedIndicesExist(indices) {
    const names = indices
        .map(indexName => [`${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}-${Config.VERSION}`])
        .reduce((memo, val) => [].concat(memo, val));
    return new Promise((resolve, reject) => {
        ElasticSearch.client.indices.exists({ index: names }, (err, data) => {
            if (err)
                return reject(err);
            console.log(`Testing index existence for ${names}:`, data);
            return resolve(data);
        });
    });
}
exports.versionedIndicesExist = versionedIndicesExist;
async function reindex(indexName, script) {
    const aliasName = `${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}`;
    const name = `${Config.ELASTICSEARCH_INDEX_NAME}_${indexName}_index`;
    console.log(`Starting reindex from ${aliasName} to ${name}...`);
    const params = {
        waitForCompletion: false,
        refresh: true,
        body: {
            conflicts: "proceed",
            source: {
                index: aliasName
            },
            dest: {
                index: name,
                version_type: "internal",
                op_type: "create",
            },
            script: {
                inline: script,
                lang: "painless"
            }
        }
    };
    const task = await new Promise((resolve, reject) => {
        ElasticSearch.client.reindex(params, (err, res) => {
            if (err)
                return reject(err);
            return resolve(res);
        });
    });
    return taskFinished(task);
}
exports.reindex = reindex;
async function taskFinished(task) {
    const completed = await new Promise((resolve, reject) => {
        console.log(`Checking existence of task:`, task);
        const params = {
            taskId: task.task
        };
        ElasticSearch.client.tasks.get(params, (err, res) => {
            if (err)
                return reject(err);
            console.log('Got task data, returning task comletion status...');
            return resolve(res.completed);
        });
    });
    if (completed)
        return true;
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(taskFinished(task));
        }, exports.POLL_INTERVAL);
    });
}
exports.taskFinished = taskFinished;
