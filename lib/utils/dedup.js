"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function dedup(arr) {
    return Object.keys(arr.reduce((memo, value) => {
        memo[value] = true;
        return memo;
    }, {}));
}
exports.dedup = dedup;
exports.default = dedup;
