"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Config = require("./config");
const ElasticSearch = require("./elasticsearch");
const indices_1 = require("./indices");
function parentForDoc(doc) {
    const types = [].concat(doc["@type"]);
    const typeMap = types.reduce((memo, type) => (Object.assign({}, memo, { [type]: true })), {});
    if ('Tag' in typeMap || 'Annotation' in typeMap) {
        return doc["tagOf"];
    }
    return null;
}
async function init({ name }) {
    const receive = async (operation) => {
        console.log('Received operation:', operation);
        const { action, data: doc } = operation;
        if (action !== 'write')
            return;
        await Promise.all(Object.keys(indices_1.default).map(async (indexName) => {
            const index = indices_1.default[indexName];
            const frames = [].concat(index.frames || index.frame || []);
            await Promise.all(frames.map(async (_frame) => {
                const frame = Object.assign({ "@context": feedbackfruits_knowledge_engine_1.Context.context }, _frame);
                const framed = await feedbackfruits_knowledge_engine_1.Doc.frame([doc], frame);
                if (framed.length === 0)
                    return;
                return Promise.all(framed.map(async (tree) => {
                    const compacted = await feedbackfruits_knowledge_engine_1.Doc.compact(tree, feedbackfruits_knowledge_engine_1.Context.context);
                    if (!index.isOperableDoc(compacted))
                        return;
                    const parent = parentForDoc(compacted);
                    console.log(`Proceeding with index:`, compacted["@id"], "with parent", parent);
                    const mapped = await index.mapDoc(compacted);
                    return ElasticSearch.index([{ doc: compacted, parent, index: indexName }]);
                }));
            }));
        }));
    };
    return await feedbackfruits_knowledge_engine_1.Broker({
        name,
        receive,
        customConfig: Config
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
