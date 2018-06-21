"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch = require("elasticsearch");
const DataLoader = require("dataloader");
const Config = require("./config");
const Helpers = require("./helpers");
const { ELASTICSEARCH_ADDRESS, ELASTICSEARCH_INDEX_NAME, } = Config;
const indices_1 = require("./indices");
let awaitingCreation = null;
let awaitingUpdate = null;
async function ensureIndices() {
    const exists = await indicesExist();
    if (!exists && !awaitingCreation)
        awaitingCreation = createIndices();
    await awaitingCreation;
    console.log('Indices exists. Updating mappings...');
    let res;
    if (!awaitingUpdate)
        awaitingUpdate = updateMapping();
    res = await awaitingUpdate;
    console.log('Mapping updated:', res);
    return true;
}
exports.ensureIndices = ensureIndices;
function createIndices() {
    console.log(`Creating indices...`);
    return Promise.all(Object.keys(indices_1.default).map(indexName => {
        return new Promise((resolve, reject) => {
            const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
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
async function indicesExist() {
    return (await Promise.all(Object.keys(indices_1.default).map(indexName => {
        return new Promise((resolve, reject) => {
            const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
            exports.client.indices.exists({ index: name }, (res, data) => {
                console.log(`Testing index existence for ${indexName} as ${name}:`, data);
                return resolve(data);
            });
        });
    }))).reduce((memo, exists) => memo && exists, true);
}
exports.indicesExist = indicesExist;
async function updateMapping() {
    return (await Promise.all(Object.keys(indices_1.default).reduce((memo, indexName) => {
        const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
        const index = indices_1.default[indexName];
        return [...memo, ...Object.entries(index.mappings).map(([type, properties]) => {
                return new Promise((resolve, reject) => {
                    exports.client.indices.putMapping({ index: name, type, body: properties }, (err, res) => {
                        if (err)
                            throw err;
                        return resolve(res);
                    });
                });
            })];
    }, [])));
}
exports.updateMapping = updateMapping;
exports.loader = new DataLoader(async (docs) => {
    return new Promise((resolve, reject) => {
        exports.client.bulk({
            body: docs.map(({ index: indexName, doc, parent }) => {
                const id = doc["@id"];
                const type = Helpers.typeFor([].concat(doc["@type"]));
                const parentType = Helpers.parentTypeForType(indexName, type);
                const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
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
