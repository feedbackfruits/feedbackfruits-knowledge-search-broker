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
const Config = require("./config");
const ElasticSearch = require("./elasticsearch");
const utils_1 = require("./utils");
const { GIZMO_ENDPONT, KNOWLEDGE_ADDRESS, } = Config;
const regex = /<http:\/\/dbpedia\.org\/resource\/(\w+)>/;
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
        return node_fetch_1.default(GIZMO_ENDPONT, {
            method: 'POST',
            body: query
        }).then(response => response.json()).then(counts => {
            let reduced = counts.result.reduce((memo, { id, count }) => {
                memo[utils_1.deiriify(id)] = count;
                return memo;
            }, {});
            console.log("Counts:", reduced);
            return reduced;
        });
    });
}
function fetchDocs(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(`Fetching docs, ids length ${ids.length}.`);
        return node_fetch_1.default(`${KNOWLEDGE_ADDRESS}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query {
        entities(id: ${JSON.stringify(ids.map(id => utils_1.deiriify(id)))}, first: ${ids.length}) {
          id,
          name
        }
      }`
            })
        }).then(response => response.json()).then((res) => {
            let { data: { entities } } = res;
            return entities && entities.length && entities[0] ? entities : [];
        });
    });
}
function mapAction({ action: { type, quad: { subject, object } }, progress }) {
    if (!subject.match(regex) && !object.match(regex))
        return [];
    return [subject, object].filter(regex.test.bind(regex));
}
function handleActions(actions) {
    return __awaiter(this, void 0, void 0, function* () {
        let ids = utils_1.dedup(actions.map(mapAction).reduce((memo, x) => memo.concat(x), []));
        if (ids.length === 0)
            return Promise.resolve();
        const docs = yield fetchDocs(ids);
        const counts = yield getCounts(docs);
        const docsWithCount = docs.map(doc => Object.assign({}, doc, { count: counts[doc.id] }));
        return ElasticSearch.index('entity', docsWithCount);
    });
}
exports.handleActions = handleActions;
