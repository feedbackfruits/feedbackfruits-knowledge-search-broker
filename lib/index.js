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
require('dotenv').load({ silent: true });
const { NAME = 'feedbackfruits-knowledge-search-broker-v26', KAFKA_ADDRESS = 'tcp://kafka:9092', INPUT_TOPIC = 'staging_quad_updates', } = process.env;
const memux = require("memux");
const PQueue = require("p-queue");
const ElasticSearch = require("./elasticsearch");
const Entity = require("./entity");
const { source, sink, send } = memux({
    name: NAME,
    url: KAFKA_ADDRESS,
    input: INPUT_TOPIC,
});
const queue = new PQueue({
    concurrency: 50
});
function doThings() {
    return __awaiter(this, void 0, void 0, function* () {
        const exists = yield ElasticSearch.indexExists();
        if (!exists)
            yield ElasticSearch.createIndex();
        return source.bufferCount(100).flatMap((actions) => {
            let { progress } = actions[actions.length - 1];
            return queue.add(() => {
                return Entity.handleActions(actions);
            }).then(() => progress);
        }).subscribe(sink);
    });
}
doThings().catch(err => console.error(err));
