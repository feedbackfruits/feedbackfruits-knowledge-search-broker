"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const config_1 = require("./config");
async function getCount(doc) {
    console.log('Getting count for doc:', doc['@id'], 'from', config_1.CAYLEY_ADDRESS);
    let query = `
    g.Emit(g.V("${feedbackfruits_knowledge_engine_1.Helpers.iriify(doc['@id'])}")
    	.In("<http://schema.org/about>")
    	.Count());
    `;
    return node_fetch_1.default(`${config_1.CAYLEY_ADDRESS}/api/v1/query/gizmo`, {
        method: 'POST',
        body: query
    })
        .then(async (response) => {
        const text = await response.text();
        console.log("Received response text:", text);
        return JSON.parse(text);
    })
        .then((result) => {
        console.log("Count:", result);
        return result.result[0];
    });
}
exports.getCount = getCount;
