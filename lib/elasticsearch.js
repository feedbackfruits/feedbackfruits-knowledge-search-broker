"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch = require("elasticsearch");
const Config = require("./config");
const { ELASTICSEARCH_ADDRESS, ELASTICSEARCH_INDEX_NAME, } = Config;
const mapping_1 = require("./mapping");
function createIndex() {
    console.log(`Creating index...`);
    return new Promise((resolve, reject) => {
        exports.client.indices.create({ index: ELASTICSEARCH_INDEX_NAME, body: mapping_1.default }, (res, data) => {
            if ('error' in data)
                return reject(data.error);
            console.log(`Index created.`);
            return resolve(data);
        });
    });
}
exports.createIndex = createIndex;
function indexExists() {
    return new Promise((resolve, reject) => {
        exports.client.indices.exists({ index: ELASTICSEARCH_INDEX_NAME }, (res, data) => {
            return resolve(data);
        });
    });
}
exports.indexExists = indexExists;
let i = 0;
function index(type, docs) {
    if (docs.length === 0)
        return Promise.resolve();
    console.log(`Indexing: ${i++}, docs length ${docs.length}.`);
    return new Promise((resolve, reject) => {
        exports.client.bulk({
            body: docs.map(doc => {
                let { id } = doc;
                return [
                    { index: { _index: ELASTICSEARCH_INDEX_NAME, _type: type, _id: id } },
                    doc
                ];
            }).reduce((memo, x) => memo.concat(x), [])
        }, (err, res) => {
            if (err)
                return reject(err);
            if (res['errors'] === true) {
                return reject(new Error(JSON.stringify(res.items.map(item => item.index.error).filter(x => x).map(x => x.reason))));
            }
            return resolve(res);
        });
    });
}
exports.index = index;
exports.client = new elasticsearch.Client({
    host: ELASTICSEARCH_ADDRESS,
    apiVersion: '5.x'
});
exports.default = exports.client;
