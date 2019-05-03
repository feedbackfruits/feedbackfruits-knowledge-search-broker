import fetch from 'node-fetch';
import * as qs from 'qs';

import { Doc, Context } from 'feedbackfruits-knowledge-engine';
import { FeaturesObj } from '..';
import * as Config from '../../config';

export async function getFeatures(doc: Doc): Promise<FeaturesObj> {
  const resources = [ doc["@id"] ];
  const query = { resources };
  const url = `${Config.KNOWLEDGE_ADDRESS}/traverse?${qs.stringify(query, { arrayFormat: 'brackets' })}`;
  const response = await fetch(url);
  const results = await response.json();

  // console.log(`Traversal result:`, results);

  const about = results
    .filter(r => r.type === Context.iris.$.Tag)
    .reduce((memo, r) => ([
      ...memo,
      {
        id: r.attributes.about.id,
        score: r.attributes.score
      }
    ]), []);

  // console.log(`About:`, JSON.stringify(about));

  return {
    about
  };
}

export const mapping = {
  properties: {
    id: {
      type: "keyword",
    },
    type: {
      type: "keyword",
    },

    name: {
      type: "text",
    },
    description: {
      type: "text",
    },
    image: {
     type: "keyword"
    },

    encoding: {
     type: "keyword",
    },

    sourceOrganization: {
      type: "keyword",
    },
    license: {
      type: "keyword",
    },

    topic: {
     type: "keyword"
    },

    about: {
      type: "nested",
      properties: {
        id: { type: "keyword" },
        score: { type: "float" },
        explicitlyMentioned: { type: "boolean" },
      }
    },
  }
};

export default mapping;
