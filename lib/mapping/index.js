"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entity_1 = require("./entity");
const resource_1 = require("./resource");
const tag_1 = require("./tag");
const annotation_1 = require("./annotation");
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
        Entity: entity_1.default,
        Resource: resource_1.default,
        Tag: tag_1.default,
        Annotation: annotation_1.default,
    }
};
