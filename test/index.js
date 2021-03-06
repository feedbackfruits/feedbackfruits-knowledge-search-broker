import test from 'ava';
import nock from 'nock';
import * as qs from 'qs';

import memux from 'memux';
import fetch from 'node-fetch';
import init from '../lib';
import { Doc, Context } from 'feedbackfruits-knowledge-engine';
import * as Config from '../lib/config';
import TraversalResult from './support/traverse';
import about from './support/about';

const resource = require('./support/resource');

nock(Config.KNOWLEDGE_ADDRESS)
  .get(`/traverse?${qs.stringify({ resources: [ resource["@id"] ]}, { arrayFormat: 'brackets' })}`)
  .reply(200, TraversalResult)
  .persist();

test('it exists', t => {
  t.not(init, undefined);
});

test('it indexes compacted flattened documents with particular types', async (t) => {
  try {
    const send = await memux({
      name: 'dummy-broker',
      url: Config.KAFKA_ADDRESS,
      output: Config.INPUT_TOPIC,
      concurrency: 1
    });

    await init({
      name: Config.NAME,
    });

    await send({ action: 'write', key: resource['@id'], data: resource });

    let timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 20000);
    });

    await timeoutPromise;
    const resourcePromise = await fetch(`${Config.ELASTICSEARCH_ADDRESS}/${Config.ELASTICSEARCH_INDEX_NAME}_resources_search/_search?size=100`);
    const resources = await resourcePromise.json();
    console.log('Result data:', JSON.stringify(resources));

    const result = resources.hits.hits.map(hit => hit._source);
    const flattened = await Doc.flatten(resource, Context.context);
    const compacted = await Promise.all(flattened.map(doc => Doc.compact(doc, Context.context)));
    // const expected = compacted.filter(doc => {
    //   const types = [].concat(doc["@type"]).reduce((memo, x) => ({ ...memo, [x]: true }),{});
    //   // console.log('Types:', types);
    //   return "Resource" in types;
    // });

    const expected = [
      {
        id: resource["@id"],
        type: resource["@type"],
        sourceOrganization: resource["sourceOrganization"],

        name: resource["name"],
        description: resource["description"],
        image: resource["image"],

        license: resource["license"],

        about: about
      }
    ]

    const sortFn = (a, b) => a["@id"].localeCompare(b["@id"]);

    t.deepEqual(result.sort(sortFn), expected.sort(sortFn));

    // await send({ action: 'write', key: entityDoc['@id'], data: entityDoc });
    //
    // const timeoutPromise2 = new Promise((resolve, reject) => {
    //   setTimeout(() => resolve(), 2000);
    // });
    //
    // await timeoutPromise2;
    // const entityPromise = await fetch(`${Config.ELASTICSEARCH_ADDRESS}/${Config.ELASTICSEARCH_INDEX_NAME}_resources_search/entity/_search`);
    // const entities = await entityPromise.json();
    // console.log('Result data:', entities);
    // return t.deepEqual(entities.hits.hits[0]._source, {
    //   ...(await docToEntity(entityDoc)),
    // });
  } catch(e) {
    console.error(e);
    throw e;
  }
});

// test('it can be queried by tag(s) using parent-child logic', async (t) => {
//   try {
//     const send = await memux({
//       name: 'dummy-broker',
//       url: KAFKA_ADDRESS,
//       output: INPUT_TOPIC,
//       concurrency: 1
//     });
//
//     await init({
//       name: NAME,
//     });
//
//     await send({ action: 'write', key: resource['@id'], data: resource });
//
//     let timeoutPromise = new Promise((resolve, reject) => {
//       setTimeout(() => resolve(), 20000);
//     });
//
//     const tag = resource.tag[0];
//     const query = {
//       query: {
//         has_child: {
//           type: "Tag",
//           query: {
//             terms: {
//               about: [ tag["about"] ]
//             }
//           }
//         }
//       }
//     };
//
//     await timeoutPromise;
//     const resourcePromise = await fetch(`${Config.ELASTICSEARCH_ADDRESS}/${Config.ELASTICSEARCH_INDEX_NAME}_resources_search/Resource/_search`, {
//       method: 'POST',
//       body: JSON.stringify(query)
//     });
//     const resources = await resourcePromise.json();
//     console.log('Result data:', resources);
//
//     const result = resources.hits.hits.map(hit => hit._source);
//     const flattened = await Doc.flatten(resource, Context.context);
//     const compacted = await Promise.all(flattened.map(doc => Doc.compact(doc, Context.context)));
//     const flattenedResourceDoc = flattened.find(doc => doc["@id"] === resource["@id"]);
//     const expected = [ flattenedResourceDoc ];
//
//     const sortFn = (a, b) => a["@id"].localeCompare(b["@id"]);
//
//     return t.deepEqual(result.sort(sortFn), expected.sort(sortFn));
//   } catch(e) {
//     console.error(e);
//     throw e;
//   }
// });
//
// test('it can be queried by annotation(s) using parent-child logic', async (t) => {
//   try {
//     const send = await memux({
//       name: 'dummy-broker',
//       url: KAFKA_ADDRESS,
//       output: INPUT_TOPIC,
//       concurrency: 1
//     });
//
//     await init({
//       name: NAME,
//     });
//
//     await send({ action: 'write', key: resource['@id'], data: resource });
//
//     let timeoutPromise = new Promise((resolve, reject) => {
//       setTimeout(() => resolve(), 20000);
//     });
//
//     const annotation = resource.annotation[0];
//     const query = {
//       query: {
//         has_child: {
//           type: "Annotation",
//           query: {
//             terms: {
//               about: [ annotation["about"] ]
//             }
//           }
//         }
//       }
//     };
//
//     await timeoutPromise;
//     const resourcePromise = await fetch(`${Config.ELASTICSEARCH_ADDRESS}/${Config.ELASTICSEARCH_INDEX_NAME}_resources_search/Resource/_search`, {
//       method: 'POST',
//       body: JSON.stringify(query)
//     });
//     const resources = await resourcePromise.json();
//
//     const result = resources.hits.hits.map(hit => hit._source);
//     const flattened = await Doc.flatten(resource, Context.context);
//     const compacted = await Promise.all(flattened.map(doc => Doc.compact(doc, Context.context)));
//     const flattenedResourceDoc = flattened.find(doc => doc["@id"] === resource["@id"]);
//     const expected = [ flattenedResourceDoc ];
//
//     const sortFn = (a, b) => a["@id"].localeCompare(b["@id"]);
//
//     console.log('Result data:', resources);
//
//     return t.deepEqual(result.sort(sortFn), expected.sort(sortFn));
//   } catch(e) {
//     console.error(e);
//     throw e;
//   }
// });

test('it can be queried with some text to autocomplete', async (t) => {
  try {
    const send = await memux({
      name: 'dummy-broker',
      url: Config.KAFKA_ADDRESS,
      output: Config.INPUT_TOPIC,
      concurrency: 1
    });

    await init({
      name: Config.NAME,
    });

    await send({ action: 'write', key: resource['@id'], data: resource });

    let timeoutPromise = new Promise((resolve, reject) => {
      setTimeout(() => resolve(), 20000);
    });

    const text = "Math";
    const query = {
      size: 5,
      _source: 'name',
      query: {
         function_score: {
          query: {
            multi_match: {
              query: text,
              fields: [ 'name' ]
            }
          },
          field_value_factor: {
            field: 'resourceCount',
            modifier: 'ln2p',
            missing: 0
          }
        }
      }
    };


    await timeoutPromise;
    const resourcePromise = await fetch(`${Config.ELASTICSEARCH_ADDRESS}/${Config.ELASTICSEARCH_INDEX_NAME}_autocomplete_search/_search`, {
      method: 'POST',
      body: JSON.stringify(query)
    });
    const resources = await resourcePromise.json();
    console.log('Autocomplete data:', JSON.stringify(resources));

    const result = resources.hits.hits.map(hit => ({
      ...hit._source,
      // score: hit._score
    }));
    const expected = [
      {
        "name": "Mathematics in medieval Islam",
        // "score": 0.67467874,,

      },
      {
        "name": "Fraction (mathematics)",
        // "score": 0.11192161,

      },
      {
        "name": "Division (mathematics)",
        // "score": 0.11192161,

      }
    ];

    // const sortFn = (a, b) => a["@id"].localeCompare(b["@id"]);


    return t.deepEqual(result, expected);
  } catch(e) {
    console.error(e);
    throw e;
  }
});
