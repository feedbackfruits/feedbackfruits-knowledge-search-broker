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
function getCounts(docs) {
    return __awaiter(this, void 0, void 0, function* () {
        let iris = docs.map(doc => `"<${doc.id}>"`);
        let query = `graph.V(${iris.join(", ")}).ForEach(function(d) {
      g.V(d.id)
      	.In("<http://schema.org/about>")
      	.Count()
      	.ForEach(function(e) {
          g.Emit({
            id: d.id,
            count: e.id
          });
        })
    })`;
        return node_fetch_1.default(`${config_1.CAYLEY_ADDRESS}/api/v1/query/gizmo`, {
            method: 'POST',
            body: query
        }).then(response => response.json()).then(counts => {
            let reduced = counts.result.reduce((memo, { id, count }) => {
                memo[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(id)] = count;
                return memo;
            }, {});
            console.log("Counts:", reduced);
            return reduced;
        });
    });
}
