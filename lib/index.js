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
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Config = require("./config");
const Helpers = require("./helpers");
const ElasticSearch = require("./elasticsearch");
const indices_1 = require("./indices");
function init({ name }) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield ElasticSearch.ensureIndices();
        if (!exists)
            yield ElasticSearch.createIndices();
        const receive = (operation) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received operation:', operation);
            const { action, data: doc } = operation;
            if (action !== 'write')
                return;
            yield Promise.all(Object.keys(indices_1.default).map((indexName) => __awaiter(this, void 0, void 0, function* () {
                const index = indices_1.default[indexName];
                const frame = Object.assign({ "@context": feedbackfruits_knowledge_engine_1.Context.context }, index.frame);
                const framed = yield feedbackfruits_knowledge_engine_1.Doc.frame([doc], frame);
                if (framed.length === 0)
                    return;
                return Promise.all(framed.map((tree) => __awaiter(this, void 0, void 0, function* () {
                    const flattenedWithParents = yield Helpers.flattenDocWithParents(tree);
                    const filtered = flattenedWithParents.filter(({ doc }) => {
                        return index.isOperableDoc(doc);
                    });
                    return ElasticSearch.index(filtered.map(x => (Object.assign({}, x, { index: indexName }))));
                })));
            })));
        });
        return yield feedbackfruits_knowledge_engine_1.Broker({
            name,
            receive,
            customConfig: Config
        });
    });
}
exports.default = init;
if (require.main === module) {
    console.log("Running as script.");
    init({
        name: Config.NAME,
    }).catch((e) => {
        console.error(e);
        throw e;
    });
}
