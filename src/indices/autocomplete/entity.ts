import { Doc } from 'feedbackfruits-knowledge-engine';
import * as Config from '../../config';
import * as ElasticSearch from '../../elasticsearch';
import { FeaturesObj } from '..';

async function getCount(entityId: string): Promise<number> {
  const name = `${Config.ELASTICSEARCH_INDEX_NAME}_resources_search`;
  const query = {
    query: {
      nested: {
        path: "about",
        query: {
          function_score: {
            query: {
              terms: {
                "about.id": [ entityId ]
              }
            },
            field_value_factor: {
              field: 'about.score'
            }
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

export function entityIdToName(entityId: string): string {
  return entityId.replace(/(https:\/\/en\.wikipedia\.org\/wiki\/|http:\/\/dbpedia\.org\/resource\/)/, '').replace(/_/g, ' ');
}

export async function getFeatures(doc: Doc): Promise<FeaturesObj> {
  const count = await getCount(doc["@id"]);
  const name = doc["name"] || entityIdToName(doc["@id"]);

  return {
    resourceCount: count,
    name
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
      id: {
        type: "keyword",
      },
      type: {
        type: "keyword",
      },
      
      name: {
         type: "text",
         analyzer: "edge_ngram_analyzer",
         search_analyzer: "english"
      },

      resourceCount: {
        type: "integer"
      }
   }
};

export default mapping;
