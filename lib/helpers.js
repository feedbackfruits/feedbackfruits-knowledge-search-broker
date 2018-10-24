"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const indices_1 = require("./indices");
function typeFor(types) {
    const typeMap = types.reduce((memo, type) => (Object.assign({}, memo, { [type]: true })), {});
    return 'Resource' in typeMap ? 'Resource' :
        'Entity' in typeMap ? 'Entity' : null;
}
exports.typeFor = typeFor;
function parentFor(original, childIds) {
    const res = Object.assign({}, childIds);
    if (original["@id"] in res)
        res[original["@id"]] = null;
    const properties = Object.keys(original);
    return properties.reduce((memo, p) => {
        const value = original[p];
        if (value instanceof Array) {
            return value.reduce((memo, child) => {
                if (typeof child !== 'object')
                    return memo;
                if (child["@id"] in memo) {
                    memo[child["@id"]] = original["@id"];
                    return memo;
                }
                else {
                    return parentFor(value, memo);
                }
            }, memo);
        }
        else if (typeof value === 'object') {
            if (typeof value !== 'object')
                return memo;
            if (value["@id"] in memo) {
                memo[value["@id"]] = original["@id"];
                return memo;
            }
            else {
                return parentFor(value, memo);
            }
        }
        return memo;
    }, res);
}
exports.parentFor = parentFor;
async function flattenDocWithParents(original) {
    const compacted = await feedbackfruits_knowledge_engine_1.Doc.compact(original, feedbackfruits_knowledge_engine_1.Context.context);
    const flattened = await feedbackfruits_knowledge_engine_1.Doc.flatten(compacted, feedbackfruits_knowledge_engine_1.Context.context);
    const ids = flattened.reduce((memo, x) => (Object.assign({}, memo, { [x["@id"]]: undefined })), {});
    const parentByDoc = parentFor(compacted, ids);
    return flattened.map(doc => {
        const parent = parentByDoc[doc["@id"]];
        return {
            doc,
            parent
        };
    });
}
exports.flattenDocWithParents = flattenDocWithParents;
function parentTypeForType(index, type) {
    return (`${type}` in indices_1.default[index].mappings && "_parent" in indices_1.default[index].mappings[type]) ? indices_1.default[index].mappings[type]._parent.type : null;
}
exports.parentTypeForType = parentTypeForType;
