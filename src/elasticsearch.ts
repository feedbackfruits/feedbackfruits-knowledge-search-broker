import elasticsearch = require('elasticsearch');

import { Doc } from 'feedbackfruits-knowledge-engine';
import * as DataLoader from 'dataloader';

import * as Config from './config';
import * as Helpers from './helpers';

const {
  ELASTICSEARCH_ADDRESS,
  ELASTICSEARCH_INDEX_NAME,
  VERSION,
} = Config;

import indices from './indices';

let awaitingIndexCreation = null;
let awaitingAliasExists = null;
let awaitingAliasCreation = null;
export async function ensureIndices() {
  if (!awaitingIndexCreation) awaitingIndexCreation = createIndices();
  await awaitingIndexCreation;

  if (Config.ELASTICSEARCH_USE_ALIASES) {
    if (!awaitingAliasExists) awaitingAliasExists = aliasesExist()
    const aliasesExists = await awaitingAliasExists;

    if (!aliasesExists) {
      if (!awaitingAliasCreation) awaitingAliasCreation = createAliases();
      await awaitingAliasCreation;
      awaitingAliasExists = aliasesExist();
    }

    // Start reindex job here if no reindex job is running already
  }

  return true;
}

export function createIndices() {
  console.log(`Creating indices...`);
  return Promise.all(Object.keys(indices).map(indexName => {
    return new Promise((resolve, reject) => {
      // console.log('Sending mapping:', mapping);
      const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}-${VERSION}`;
      const index = indices[indexName];

      client.indices.create({ index: name, body: index }, (res, data) => {
        if ('error' in data) return reject(data.error);
        console.log(`Index ${indexName} created as ${name}.`);
        return resolve(data);
      });
    });
  }));
}

export async function aliasesExist() {
  const aliasNames = Object.keys(indices).map(indexName => `${ELASTICSEARCH_INDEX_NAME}_${indexName}`).join(',');
  return new Promise((resolve, reject) => {
    client.indices.existsAlias({ name: aliasNames }, (err, data) => {
      if (err) return reject(err);
      console.log(`Testing index existence for ${aliasNames}:`, data);
      return resolve(data);
    });
  })
}

export function createAliases() {
  console.log(`Creating aliases...`);
  return Promise.all(Object.keys(indices).map(indexName => {
    return new Promise((resolve, reject) => {
      // console.log('Sending mapping:', mapping);
      const aliasName = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
      const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}-${VERSION}`;

      client.indices.putAlias({ name: aliasName, index: name }, (err, data) => {
        if (err) return reject(err);
        console.log(`Alias ${aliasName} created pointing to ${name}.`);
        return resolve(data);
      });
    });
  }));
}

export async function reindexFromAlias() {
  return Promise.all(Object.keys(indices).map(async indexName => {
    const task = await new Promise((resolve, reject) => {
      const aliasName = `${ELASTICSEARCH_INDEX_NAME}_${indexName}`;
      const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}-${VERSION}`;
      const params = {
        waitForCompletion: false, // Run task in the background
        refresh: true, // Refresh index once done
        body: {
          conflicts: "proceed", // Don't break the job if one document breaks on reindexing
          op_type: "create", // The reindexed data is stale, so no need to update anything, just creating missing data is fine
          version_type: "internal", // Don't care about the version of the stale doc
          source: {
            index: aliasName
          },
          destination: {
            index: name
          }
        }
      };

      client.reindex(params, (err, res) => {
        if (err) return reject(err);
        return resolve(res);
      });
    });

    return task;
  }));
}

export const loader = new DataLoader<any, any>(async (docs: any) => {
  return new Promise<any[]>((resolve, reject) => {
      client.bulk({
        body: docs.map(({ index: indexName, doc, parent }) => {
          const id = doc["@id"];
          const type = Helpers.typeFor([].concat(doc["@type"]));
          const parentType = Helpers.parentTypeForType(indexName, type);
          const name = `${ELASTICSEARCH_INDEX_NAME}_${indexName}-${VERSION}`;

          console.log(`Indexing to ${indexName} as ${name} ${type} ${id} <-- ${parent} of type ${parentType}`);
          return [
            {
              update: {
                _index: name,
                _id: id,
                _type: type,
                _retry_on_conflict: 3,
                ...((parentType && parent) ? { parent } : {})
              }
            },
            { doc, doc_as_upsert: true }
          ];
        }).reduce((memo, x) => memo.concat(x), [])
      }, (err, res) => {
        if (err) return reject(err);
        if (res['errors'] === true) {
          return reject(new Error(JSON.stringify(res)));
        }
        console.log('Indexing succesfull!');
        return resolve(docs);
      });
  });
}, {
  maxBatchSize: Config.INDEX_BATCH_SIZE
});

let i = 0;
export async function index(docs: Array<{ index: string, doc: Doc, parent: string | null }>): Promise<void> {
  if (docs.length === 0) return Promise.resolve();
  console.log(`Indexing: ${i++}, docs length ${docs.length}.`);
  await Promise.all(docs.map(doc => loader.load(doc)));
  return;
}

export const client = new elasticsearch.Client({
  host: ELASTICSEARCH_ADDRESS,
  apiVersion: '5.x'
});

export default client;
