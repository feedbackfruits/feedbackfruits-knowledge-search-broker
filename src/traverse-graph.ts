import fetch from 'node-fetch';
import * as Config from './config';

const {
  KNOWLEDGE_ADDRESS,
} = Config;

const globalDone = {};

const Context = {
  Knowledge: {
    Topic: "https://knowledge.express/Topic",
    Resource: "https://knowledge.express/Resource",
    Entity: "https://knowledge.express/Entity"
  }
};

const RootFields = {
  [Context.Knowledge.Topic]: "topic",
  [Context.Knowledge.Resource]: "resource",
  [Context.Knowledge.Entity]: "entity"
};

const Edges = {
  [Context.Knowledge.Topic]: {
    children: 0.5,
    parents: 0.5,
    successors: 0.9,
    predecessors: 0.1,
    resources: 0.5
  },
  [Context.Knowledge.Resource]: {
    topics: 0.5,
    entities: 0.3
  },
  [Context.Knowledge.Entity]: {
    resources: 0.7
  }
};

const Attributes = {
  [Context.Knowledge.Topic]: ["name"],
  [Context.Knowledge.Entity]: ["name"],
  [Context.Knowledge.Resource]: ["name", "description", "license", "sourceOrganization"]
};

const matchTypes = {
  [Context.Knowledge.Resource]: true,
  // [Context.Knowledge.Entity]: true,
};

const match = document => {
  return document.type in matchTypes;
};

const threshold = 0.7;

const fetchDoc = (done = {}, query) => {
  if (query in done) {
    return done[query];
  }

  return done[query] = fetch(`${KNOWLEDGE_ADDRESS}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query
    })
  });
};

const traverseGraph = ({ done = {}, results = [], score = 1 } = {}, { id, type }) => {
  if (score < threshold) {
    return Promise.resolve({ done, results, score });
  }

  if (!id || !type) {
    return Promise.resolve({ done, results, score });
  }

  const rootField = RootFields[type];
  if (!rootField) {
    return Promise.resolve({ done, results, score });
  }

  const edges = Edges[type] || {};
  const attributes = Attributes[type] || [];

  const query = `
    query {
      ${rootField}(id: "${id}") {
        id,
        type,
        ${attributes.join(",\n")},
        ${Object.keys(edges).map(edge => `${edge} { id, type }`).join(",\n")}
      }
    }
  `;

  return fetchDoc(done, query).then(({data}) => {
    const document = data[rootField];

    if (!document) {
      return { done, results, score };
    }

    if (match(document)) {
      results.push({
        score, document
      });
    }

    return Promise.all(Object.keys(edges).map((edge) => {
      return Promise.all(document[edge].map(object => {
        let penalty = edges[edge];
        let newScore = score * (penalty as number);

        return traverseGraph({ done, results, score: newScore }, object);
      }));
    }));
  }).then(() => {
    return { done, results, score };
  });
};

function compareDocs([aId, { score: aScore }], [bId, { score: bScore } ]) {
  return aScore > bScore ? -1 : 1;
}

function formatDoc([id, { score, document }]) {
  return {
    id,
    score,
    type: document.type,
    name: document.name,
    description: document.description,
    license: document.license,
    sourceOrganization: document.sourceOrganization,
    entities: document.entities
  };
}

function formatResults(results) {
  const docScores = results.reduce((memo, {score, document}) => {
    if (document.id in memo) {
      memo[document.id] = { score: memo[document.id].score + score, document };
    } else {
      memo[document.id] = { score, document };
    }

    return memo;
  }, {});

  return docScores.map((x, k) => [k, x]).sort(compareDocs).map(formatDoc);
}

function combineResults(results, otherResults) {
  return [].concat(results, otherResults);
}

export async function traverse(entities) {
  const results = await Promise.all(entities.map(id => {
    return traverseGraph(globalDone, { id, type: Context.Knowledge.Entity}).then(({ results: res }) => res);
  }));

  return formatResults(results.reduce(combineResults, []));
}

export default traverse;
