import fetch from 'node-fetch';
import { Helpers } from 'feedbackfruits-knowledge-engine';

import { CAYLEY_ADDRESS} from './config';

export async function getCount(doc) {
  // let iris = docs.map(doc => `"<${doc.id}>"`).join(", ");
  console.log('Getting count for doc:', doc['@id'])
  let query = `
    g.Emit(g.V("${Helpers.iriify(doc['@id'])}")
    	.In("<http://schema.org/about>")
    	.Count());
    `;

  return fetch(`${CAYLEY_ADDRESS}/api/v1/query/gizmo`, {
    method: 'POST',
    body: query
  })
  .then(async response => {
    const text = await response.text();
    console.log("Received response text:", text);
    return JSON.parse(text);
  })
  .then((result) => {
    // let reduced = counts.result.reduce((memo, { id, count }) => {
    //   memo[Helpers.decodeIRI(id)] = count;
    //   return memo;
    // }, {});

    console.log("Count:", result);

    return result.result[0];
  });
}


export type Entity = {
  id: string,
  name: string,
  count: number
};
