import { Doc } from 'feedbackfruits-knowledge-engine';
import * as Config from '../../config';
import * as ElasticSearch from '../../elasticsearch';

async function getCount(entityId: string): Promise<number> {
  const name = `${Config.ELASTICSEARCH_INDEX_NAME}_resources_search`;
  const query = {
    query: {
      has_child: {
        type: "Tag",
        query: {
          terms: {
            about: [ entityId ]
          }
        }
      }
    }
  };

  const result = await ElasticSearch.client.count({
    index: name,
    body: JSON.stringify(query)
  });

  console.log(`Count result for ${entityId}:`, result);

  return result.count;
}

export type FeaturesObj = { [key: string]: any };
export async function getFeatures(doc: Doc): Promise<FeaturesObj> {
  const count = await getCount(doc["@id"]);

  return {
    // resourceCount: count,

    // level: 1,
    // usage: 0.5,
    //
    // parents: [
    //
    // ],
    // children: [
    //
    // ]
  }
}

export const mapping = {
   properties: {
      "@id": {
        type: "keyword",
      },
      "@type": {
        type: "keyword",
      },

      name: {
         type: "text",
         analyzer: "edge_ngram_analyzer",
         search_analyzer: "english"
      },

      count: {
        type: "integer"
      }
   }
};

export default mapping;
