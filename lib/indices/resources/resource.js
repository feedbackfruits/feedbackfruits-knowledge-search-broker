"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const qs = require("qs");
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Config = require("../../config");
async function getFeatures(doc) {
    const resources = [doc["@id"]];
    const query = { resources };
    const url = `${Config.KNOWLEDGE_ADDRESS}/traverse?${qs.stringify(query, { arrayFormat: 'brackets' })}`;
    const response = await node_fetch_1.default(url);
    const results = await response.json();
    const about = results
        .filter(r => r.type === feedbackfruits_knowledge_engine_1.Context.iris.$.Tag)
        .reduce((memo, r) => ([
        ...memo,
        {
            id: r.attributes.about.id,
            score: r.attributes.score
        }
    ]), []);
    return {
        about
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
        },
        description: {
            type: "text",
        },
        image: {
            type: "keyword"
        },
        encoding: {
            type: "keyword",
        },
        sourceOrganization: {
            type: "keyword",
        },
        license: {
            type: "keyword",
        },
        topic: {
            type: "keyword"
        },
        about: {
            type: "nested",
            properties: {
                id: { type: "keyword" },
                score: { type: "float" },
                explicitlyMentioned: { type: "boolean" },
            }
        },
    }
};
exports.default = exports.mapping;
