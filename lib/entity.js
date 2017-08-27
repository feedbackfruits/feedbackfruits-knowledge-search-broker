"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = require("node-fetch");
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const config_1 = require("./config");
function getCount(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Getting count for doc:', doc['@id']);
        let query = `
    g.Emit(g.V("${feedbackfruits_knowledge_engine_1.Helpers.iriify(doc['@id'])}")
    	.In("<http://schema.org/about>")
    	.Count());
    `;
        return node_fetch_1.default(`${config_1.CAYLEY_ADDRESS}/api/v1/query/gizmo`, {
            method: 'POST',
            body: query
        })
            .then((response) => __awaiter(this, void 0, void 0, function* () {
            const text = yield response.text();
            console.log("Received response text:", text);
            return JSON.parse(text);
        }))
            .then((result) => {
            console.log("Count:", result);
            return result.result[0];
        });
    });
}
exports.getCount = getCount;
