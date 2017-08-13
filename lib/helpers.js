"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Context = require("feedbackfruits-knowledge-context");
function isEntityDoc(doc) {
    return (doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.type)].indexOf(Context.Knowledge.Entity) > -1);
}
exports.isEntityDoc = isEntityDoc;
function isResourceDoc(doc) {
    return (doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.type)].indexOf(Context.Knowledge.Resource) > -1);
}
exports.isResourceDoc = isResourceDoc;
function isOperableDoc(doc) {
    return isEntityDoc(doc) || isResourceDoc(doc);
}
exports.isOperableDoc = isOperableDoc;
function docToEntity(doc) {
    return {
        id: doc['@id'],
        name: doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.name)],
    };
}
exports.docToEntity = docToEntity;
function docToResource(doc) {
    return {
        id: doc['@id'],
        name: doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.name)],
        entities: doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.about)].map(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI).map(id => ({ id }))
    };
}
exports.docToResource = docToResource;
