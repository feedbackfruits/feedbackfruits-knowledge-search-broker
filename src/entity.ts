import fetch from 'node-fetch';

import * as Config from './config';
import * as ElasticSearch from './elasticsearch';
import { deiriify, dedup } from './utils';

const {
  GIZMO_ENDPONT,
  KNOWLEDGE_ADDRESS,
} = Config;

const regex = /<http:\/\/dbpedia\.org\/resource\/(\w+)>/;

async function getCounts(docs) {
  let iris = docs.map(doc => `"<${doc.id}>"`);
  let query = `graph.V(${iris.join(", ")}).ForEach(function(d) {
      g.V(d.id)
      	.In("<http://schema.org/about>")
      	.Count()
      	.ForEach(function(e) {
          g.Emit({
            id: d.id,
            count: e.id
          });
        })
    })`;

  return fetch(GIZMO_ENDPONT, {
    method: 'POST',
    body: query
  }).then(response => response.json()).then(counts => {
    let reduced = counts.result.reduce((memo, { id, count }) => {
      memo[deiriify(id)] = count;
      return memo;
    }, {});

    console.log("Counts:", reduced);

    return reduced;
  });
}

async function fetchDocs(ids) {
  console.log(`Fetching docs, ids length ${ids.length}.`);
  return fetch(`${KNOWLEDGE_ADDRESS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query: `query {
        entities(id: ${JSON.stringify(ids.map(id => deiriify(id)))}, first: ${ids.length}) {
          id,
          name
        }
      }`
    })
  }).then(response => response.json()).then((res) => {
    let { data: { entities } } = res;
    return entities && entities.length && entities[0] ? entities : [];
  });
}

function mapAction({ action: { type, quad: { subject, object } }, progress }) {
  if (!subject.match(regex) && !object.match(regex)) return [];
  return [subject, object].filter(regex.test.bind(regex));
}

async function handleActions(actions) {
  let ids = dedup(actions.map(mapAction).reduce((memo, x) => memo.concat(x), []));

  if (ids.length === 0) return Promise.resolve();
  const docs = await fetchDocs(ids)
  const counts = await getCounts(docs);
  const docsWithCount = docs.map(doc => Object.assign({}, doc, { count: counts[doc.id] }));
  return ElasticSearch.index('entity', docsWithCount);
}

export {
  handleActions
}
