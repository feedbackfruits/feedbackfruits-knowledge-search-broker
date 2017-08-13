"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const elasticsearch = require("elasticsearch");
const Config = require("./config");
const { ELASTICSEARCH_ADDRESS, ELASTICSEARCH_INDEX_NAME, } = Config;
exports.mapping = {
    "settings": {
        "analysis": {
            "filter": {
                "edge_ngram_filter": {
                    "type": "edge_ngram",
                    "min_gram": 2,
                    "max_gram": 20
                }
            },
            "analyzer": {
                "edge_ngram_analyzer": {
                    "type": "custom",
                    "tokenizer": "standard",
                    "filter": [
                        "lowercase",
                        "edge_ngram_filter"
                    ]
                }
            }
        }
    },
    "mappings": {
        "entity": {
            "properties": {
                "name": {
                    "type": "text",
                    "analyzer": "edge_ngram_analyzer",
                    "search_analyzer": "english"
                },
                "count": {
                    "type": "integer"
                }
            }
        }
    }
};
function createIndex() {
    console.log(`Creating index...`);
    return new Promise((resolve, reject) => {
        exports.client.indices.create({ index: ELASTICSEARCH_INDEX_NAME, body: exports.mapping }, (res, data) => {
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
                let { id, name } = doc;
                return [
                    { index: { _index: ELASTICSEARCH_INDEX_NAME, _type: type, _id: id } },
                    doc
                ];
            }).reduce((memo, x) => memo.concat(x), [])
        }, (err, res) => {
            if (err)
                return reject(err);
            if (res['errors'] === true) {
                return reject(res.map(item => item.index.error).filter(x => x).map(x => x.reason));
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
