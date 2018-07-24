"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Entity = require("./entity");
function isOperableDoc(doc) {
    return typeFor([].concat(doc["@type"])) != null;
}
function typeFor(types) {
    const typeMap = types.reduce((memo, type) => (Object.assign({}, memo, { [type]: true })), {});
    return 'Entity' in typeMap ? 'Entity' : null;
}
async function mapDoc(doc) {
    const type = typeFor([].concat(doc["@type"]));
    if (!(type === 'Entity'))
        return doc;
    const features = await Entity.getFeatures(doc);
    return Object.assign({}, doc, features);
}
exports.default = {
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
        "Entity": Entity.mapping,
    },
    frame: {
        "@type": feedbackfruits_knowledge_engine_1.Context.iris.$.Entity
    },
    isOperableDoc,
    mapDoc
};
