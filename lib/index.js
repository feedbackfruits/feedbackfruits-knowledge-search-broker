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
function init({ name }) {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield ElasticSearch.ensureIndex();
        if (!exists)
            yield ElasticSearch.createIndex();
        const receive = (operation) => __awaiter(this, void 0, void 0, function* () {
            console.log('Received operation:', operation);
            const { action, data: doc } = operation;
            if (action !== 'write')
                return;
            const flattenedWithParents = yield Helpers.flattenDocWithParents(doc);
            const filtered = flattenedWithParents.filter(({ doc }) => {
                return Helpers.isOperableDoc(doc);
            });
            return ElasticSearch.index(filtered);
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
