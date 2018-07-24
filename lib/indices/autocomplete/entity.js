"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config = require("../../config");
const ElasticSearch = require("../../elasticsearch");
async function getCount(entityId) {
    const name = `${Config.ELASTICSEARCH_INDEX_NAME}_resources_search`;
    const query = {
        query: {
            has_child: {
                type: "Tag",
                query: {
                    terms: {
                        about: [entityId]
                    }
                }
            }
        }
    };
    const result = await ElasticSearch.client.count({
        index: name,
        body: JSON.stringify(query)
    });
    console.log(`Count result for ${entityId}:`, result);
    return result.count;
}
async function getFeatures(doc) {
    const count = await getCount(doc["@id"]);
    return {
        resourceCount: count,
    };
}
exports.getFeatures = getFeatures;
exports.mapping = {
    properties: {
        name: {
            type: "text",
            analyzer: "edge_ngram_analyzer",
            search_analyzer: "english"
        },
        count: {
            type: "integer"
        }
    }
};
exports.default = exports.mapping;
