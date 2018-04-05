"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tag_1 = require("./tag");
exports.default = Object.assign({}, tag_1.default, { properties: Object.assign({}, tag_1.default.properties, { "startPosition": {
            type: "integer",
        }, "confidence": {
            type: "double",
        }, "detectedAs": {
            type: "text",
        } }) });
