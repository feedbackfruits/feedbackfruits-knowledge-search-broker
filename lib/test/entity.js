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
const ava_1 = require("ava");
const memux_1 = require("memux");
const node_fetch_1 = require("node-fetch");
const lib_1 = require("../lib");
const config_1 = require("../lib/config");
const helpers_1 = require("../lib/helpers");
const entityDoc = {
    '@id': 'http://dbpedia.org/resource/Divisor',
    'http://schema.org/description': [
        'In mathematics a divisor of an integer , also called a factor of , is an integer that can be multiplied by some other integer to produce . An integer is divisible by another integer if is a factor of , so that dividing by leaves no remainder.',
    ],
    'http://schema.org/image': [
        'http://commons.wikimedia.org/wiki/Special:FilePath/Cuisenaire_ten.JPG',
    ],
    'http://schema.org/name': [
        'Divisor',
    ],
    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type': [
        '<https://knowledge.express/Entity>',
    ],
};
ava_1.default('it brokers entities', (t) => __awaiter(this, void 0, void 0, function* () {
    try {
        const send = yield memux_1.default({
            name: 'dummy-broker',
            url: config_1.KAFKA_ADDRESS,
            output: config_1.INPUT_TOPIC,
            concurrency: 1
        });
        yield lib_1.default({
            name: config_1.NAME,
        });
        yield send({ action: 'write', key: entityDoc['@id'], data: entityDoc });
        const timeoutPromise = new Promise((resolve, reject) => {
            setTimeout(() => resolve(), 3000);
        });
        yield timeoutPromise;
        const resultPromise = yield node_fetch_1.default(`${config_1.ELASTICSEARCH_ADDRESS}/${config_1.ELASTICSEARCH_INDEX_NAME}/_search`);
        const result = yield resultPromise.json();
        console.log('Result data:', result);
        return t.deepEqual(result.hits.hits[0]._source, Object.assign({}, helpers_1.docToEntity(entityDoc)));
    }
    catch (e) {
        console.error(e);
        throw e;
    }
}));
