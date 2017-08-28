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
const Context = require("feedbackfruits-knowledge-context");
const entity_1 = require("./entity");
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
    return __awaiter(this, void 0, void 0, function* () {
        const count = yield entity_1.getCount(doc);
        return {
            id: doc['@id'],
            name: doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.name)],
            count
        };
    });
}
exports.docToEntity = docToEntity;
function docToResource(doc) {
    return {
        id: doc['@id'],
        type: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.type)]).map(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI),
        name: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.name)])[0],
        description: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.description)])[0],
        license: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.license)])[0],
        sourceOrganization: [].concat(doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.sourceOrganization)])[0],
        entities: doc[feedbackfruits_knowledge_engine_1.Helpers.decodeIRI(Context.about)].map(feedbackfruits_knowledge_engine_1.Helpers.decodeIRI).map((id) => ({ id }))
    };
}
exports.docToResource = docToResource;
