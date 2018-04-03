"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    properties: {
        ac_name: {
            type: "text",
            analyzer: "edge_ngram_analyzer",
            search_analyzer: "english"
        },
        count: {
            type: "integer"
        }
    }
};
