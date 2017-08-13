import fetch from 'node-fetch';
import { Helpers } from 'feedbackfruits-knowledge-engine';

import { CAYLEY_ADDRESS} from './config';

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

  return fetch(`${CAYLEY_ADDRESS}/api/v1/query/gizmo`, {
    method: 'POST',
    body: query
  }).then(response => response.json()).then(counts => {
    let reduced = counts.result.reduce((memo, { id, count }) => {
      memo[Helpers.decodeIRI(id)] = count;
      return memo;
    }, {});

    console.log("Counts:", reduced);

    return reduced;
  });
}


export type Entity = {
  id: string,
  name: string,
};
