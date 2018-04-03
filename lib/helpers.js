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
const entity_1 = require("./entity");
const mapping_1 = require("./mapping");
function isOperableDoc(doc) {
    return typeFor([].concat(doc["@type"])) != null;
}
exports.isOperableDoc = isOperableDoc;
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
            if (!isOperableDoc(doc))
                return memo;
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
function parentForType(type) {
    return (`${type}` in mapping_1.default.mappings && "_parent" in mapping_1.default.mappings[type]) ? mapping_1.default.mappings[type]._parent.type : null;
}
exports.parentForType = parentForType;
function docToEntity(doc) {
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield entity_1.getCount(doc);
        return {
            id: doc['@id'],
            name: doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.schema.name)],
            count
        };
    });
}
exports.docToEntity = docToEntity;
function docToResource(doc) {
    return {
        id: doc['@id'],
        type: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.rdf.type)]).map(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI),
        name: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.schema.name)])[0],
        description: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.schema.description)])[0],
        license: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.schema.license)])[0],
        sourceOrganization: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.schema.sourceOrganization)])[0],
        entities: doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(feedbackfruits_knowledge_engine_1.Context.iris.schema.about)].map(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI).map((id) => ({ id }))
    };
}
exports.docToResource = docToResource;
