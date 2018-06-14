"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const feedbackfruits_knowledge_engine_1 = require("feedbackfruits-knowledge-engine");
const resource_1 = require("./resource");
const tag_1 = require("./tag");
const annotation_1 = require("./annotation");
function isOperableDoc(doc) {
    return typeFor([].concat(doc["@type"])) != null;
}
function typeFor(types) {
    const typeMap = types.reduce((memo, type) => (Object.assign({}, memo, { [type]: true })), {});
    return 'Resource' in typeMap ? 'Resource' :
        'Tag' in typeMap ? 'Tag' :
            'Annotation' in typeMap ? 'Annotation' : null;
}
exports.default = {
    "mappings": {
        Resource: resource_1.default,
        Tag: tag_1.default,
        Annotation: annotation_1.default,
    },
    frames: [
        {
            "@type": feedbackfruits_knowledge_engine_1.Context.iris.$.Resource
        },
        {
            "@type": feedbackfruits_knowledge_engine_1.Context.iris.$.Tag
        },
        {
            "@type": feedbackfruits_knowledge_engine_1.Context.iris.$.Annotation
        },
    ],
    isOperableDoc
};
