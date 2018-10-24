"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Config = require("../../config");
const ElasticSearch = require("../../elasticsearch");
async function getCount(entityId) {
    const name = `${Config.ELASTICSEARCH_INDEX_NAME}_resources_search`;
    const query = {
        query: {
            nested: {
                path: "about",
                query: {
                    function_score: {
                        query: {
                            terms: {
                                "about.id": [entityId]
                            }
                        },
                        field_value_factor: {
                            field: 'about.score'
                        }
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
function entityIdToName(entityId) {
    return entityId.replace(/(https:\/\/en\.wikipedia\.org\/wiki\/|http:\/\/dbpedia\.org\/resource\/)/, '').replace(/_/g, ' ');
}
exports.entityIdToName = entityIdToName;
async function getFeatures(doc) {
    const count = await getCount(doc["@id"]);
    const name = doc["name"] || entityIdToName(doc["@id"]);
    return {
        resourceCount: count,
        name
    };
}
exports.getFeatures = getFeatures;
exports.mapping = {
    properties: {
        id: {
            type: "keyword",
        },
        type: {
            type: "keyword",
        },
        name: {
            type: "text",
            analyzer: "edge_ngram_analyzer",
            search_analyzer: "english"
        },
        resourceCount: {
            type: "integer"
        }
    }
};
exports.default = exports.mapping;
