"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const Resource = require("./resource");
function isOperableDoc(doc) {
    return typeFor([].concat(doc["@type"])) != null;
}
function typeFor(types) {
    const typeMap = types.reduce((memo, type) => (Object.assign({}, memo, { [type]: true })), {});
    return 'Resource' in typeMap ? 'Resource' : null;
}
function filterDoc(doc) {
    const allowedKeys = Object.keys(Resource.mapping.properties).reduce((memo, key) => (Object.assign({}, memo, { [key]: true })), {});
    return Object.entries(doc).reduce((memo, [key, value]) => {
        return Object.assign({}, memo, (key in allowedKeys ? { [key]: value } : {}));
    }, {});
}
async function mapDoc(doc) {
    const type = typeFor([].concat(doc["@type"]));
    if (!(type === 'Resource'))
        return doc;
    const features = await Resource.getFeatures(doc);
    return filterDoc(Object.assign({ id: doc["@id"], type: doc["@type"] }, doc, features));
}
exports.default = {
    "mappings": {
        Resource: Resource.mapping,
    },
    frames: [
        {
            "@type": feedbackfruits_knowledge_engine_1.Context.iris.$.Resource
        },
    ],
    isOperableDoc,
    mapDoc
};
