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
const indices_1 = require("./indices");
function typeFor(types) {
    const typeMap = types.reduce((memo, type) => (Object.assign({}, memo, { [type]: true })), {});
    return 'Resource' in typeMap ? 'Resource' :
        'Entity' in typeMap ? 'Entity' :
            'Tag' in typeMap ? 'Tag' :
                'Annotation' in typeMap ? 'Annotation' : null;
}
exports.typeFor = typeFor;
function parentFor(original, childId) {
    if (original["@id"] === childId)
        return null;
    const properties = Object.keys(original);
    return properties.reduce((memo, p) => {
        if (memo)
            return memo;
        const value = original[p];
        if (value instanceof Array) {
            return value.reduce((memo, child) => {
                if (memo)
                    return memo;
                if (typeof child !== 'object')
                    return null;
                if (child["@id"] == childId)
                    return original["@id"];
                else {
                    const maybeParent = parentFor(value, childId);
                    return maybeParent != null ? maybeParent : null;
                }
            }, memo);
        }
        else if (typeof value === 'object') {
            if (typeof value !== 'object')
                return null;
            if (value["@id"] === childId)
                return original["@id"];
            else {
                const maybeParent = parentFor(value, childId);
                return maybeParent != null ? maybeParent : null;
            }
        }
        return null;
    }, null);
}
exports.parentFor = parentFor;
function flattenDocWithParents(original) {
    return __awaiter(this, void 0, void 0, function* () {
        const compacted = yield feedbackfruits_knowledge_engine_1.Doc.compact(original, feedbackfruits_knowledge_engine_1.Context.context);
        const flattened = yield feedbackfruits_knowledge_engine_1.Doc.flatten(compacted, feedbackfruits_knowledge_engine_1.Context.context);
        const parentByDoc = flattened.reduce((memo, doc) => {
            const id = doc["@id"];
            const parentId = parentFor(compacted, id);
            return Object.assign({}, memo, { [id]: parentId });
        }, {});
        return flattened.map(doc => {
            const parent = parentByDoc[doc["@id"]];
            return {
                doc,
                parent
            };
        });
    });
}
exports.flattenDocWithParents = flattenDocWithParents;
function parentTypeForType(index, type) {
    return (`${type}` in indices_1.default[index].mappings && "_parent" in indices_1.default[index].mappings[type]) ? indices_1.default[index].mappings[type]._parent.type : null;
}
exports.parentTypeForType = parentTypeForType;
