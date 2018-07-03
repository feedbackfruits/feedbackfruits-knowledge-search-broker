"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch = require("elasticsearch");
const DataLoader = require("dataloader");
const Config = require("./config");
const Helpers = require("./helpers");
const { ELASTICSEARCH_ADDRESS, ELASTICSEARCH_INDEX_NAME, VERSION, } = Config;
const indices_1 = require("./indices");
function createIndices() {
    console.log(`Creating indices...`);
    return Promise.all(Object.keys(indices_1.default).map(indexName => {
        return new Promise((resolve, reject) => {
            const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}-${VERSION}`;
            const index = indices_1.default[indexName];
            exports.client.indices.create({ index: name, body: index }, (res, data) => {
                if ('error' in data)
                    return reject(data.error);
                console.log(`Index ${indexName} created as ${name}.`);
                return resolve(data);
            });
        });
    }));
}
exports.createIndices = createIndices;
async function updateAlias(alias, index) {
    const exists = await new Promise((resolve, reject) => {
        exports.client.indices.existsAlias({ name: alias }, (err, data) => {
            if (err)
                return reject(err);
            console.log(`Alias ${alias} exists?`, data);
            return resolve(data);
        });
    });
    if (exists) {
        console.log(`Alias ${alias} exists. Deleting...`);
        await new Promise((resolve, reject) => {
            exports.client.indices.deleteAlias({ name: alias, index: '_all' }, (err, data) => {
                if (err)
                    return reject(err);
                console.log(`Alias ${alias} exists?`, data);
                return resolve(data);
            });
        });
    }
    return new Promise((resolve, reject) => {
        exports.client.indices.putAlias({ name: alias, index: index }, (err, data) => {
            if (err)
                return reject(err);
            console.log(`Alias ${alias} created pointing to ${index}.`);
            return resolve(data);
        });
    });
}
exports.updateAlias = updateAlias;
async function updateIndexingAliases() {
    console.log(`Updating indexing aliases...`);
    return Promise.all(Object.keys(indices_1.default).map(async (name) => {
        const indexAliasName = `${ELASTICSEARCH_INDEX_NAME}_${name}_index`;
        const indexName = `${ELASTICSEARCH_INDEX_NAME}_${name}-${VERSION}`;
        return updateAlias(indexAliasName, indexName);
    }));
}
exports.updateIndexingAliases = updateIndexingAliases;
async function updateSearchAliases() {
    console.log(`Updating search aliases...`);
    return Promise.all(Object.keys(indices_1.default).map(async (name) => {
        const searchAliasName = `${ELASTICSEARCH_INDEX_NAME}_${name}_search`;
        const indexName = `${ELASTICSEARCH_INDEX_NAME}_${name}-${VERSION}`;
        return updateAlias(searchAliasName, indexName);
    }));
}
exports.updateSearchAliases = updateSearchAliases;
async function reindexFromSearchAlias() {
    return Promise.all(Object.keys(indices_1.default).map(async (indexName) => {
        const task = await new Promise((resolve, reject) => {
            const aliasName = `${ELASTICSEARCH_INDEX_NAME}_${indexName}_search`;
            const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}_index`;
            console.log(`Starting reindex from ${aliasName} to ${name}...`);
            const params = {
                waitForCompletion: true,
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
                    }
                }
            };
            exports.client.reindex(params, (err, res) => {
                if (err)
                    return reject(err);
                return resolve(res);
            });
        });
        return task;
    }));
}
exports.reindexFromSearchAlias = reindexFromSearchAlias;
exports.loader = new DataLoader(async (docs) => {
    return new Promise((resolve, reject) => {
        exports.client.bulk({
            body: docs.map(({ index: indexName, doc, parent }) => {
                const id = doc["@id"];
                const type = Helpers.typeFor([].concat(doc["@type"]));
                const parentType = Helpers.parentTypeForType(indexName, type);
                const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}_index`;
                console.log(`Indexing to ${indexName} as ${name} ${type} ${id} <-- ${parent} of type ${parentType}`);
                return [
                    {
                        update: Object.assign({ _index: name, _id: id, _type: type, _retry_on_conflict: 3 }, ((parentType && parent) ? { parent } : {}))
                    },
                    { doc, doc_as_upsert: true }
                ];
            }).reduce((memo, x) => memo.concat(x), [])
        }, (err, res) => {
            if (err)
                return reject(err);
            if (res['errors'] === true) {
                return reject(new Error(JSON.stringify(res)));
            }
            console.log('Indexing succesfull!');
            return resolve(docs);
        });
    });
}, {
    maxBatchSize: Config.INDEX_BATCH_SIZE
});
let i = 0;
async function index(docs) {
    if (docs.length === 0)
        return Promise.resolve();
    console.log(`Indexing: ${i++}, docs length ${docs.length}.`);
    await Promise.all(docs.map(doc => exports.loader.load(doc)));
    return;
}
exports.index = index;
exports.client = new elasticsearch.Client({
    host: ELASTICSEARCH_ADDRESS,
    apiVersion: '5.x'
});
exports.default = exports.client;
