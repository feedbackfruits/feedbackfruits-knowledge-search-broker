import { Context, Doc } from 'feedbackfruits-knowledge-engine';

import * as Entity from './entity';

function isOperableDoc(doc: Doc): boolean {
  return typeFor([].concat(doc["@type"])) != null;
}

function typeFor(types: string[]): string {
  const typeMap = types.reduce((memo, type) => ({ ...memo, [type]: true }), {});
  return 'Entity' in typeMap ? 'Entity' : null;
}

async function mapDoc(doc: Doc): Promise<Doc> {
  const type = typeFor([].concat(doc["@type"]));
  if (!(type === 'Entity')) return doc;

  const features = await Entity.getFeatures(doc);

  return {
    ...doc,
    ...features,
  };
}

export default {
   "settings": {
      "analysis": {
         "filter": {
            "edge_ngram_filter": {
               "type": "edge_ngram",
               "min_gram": 2,
               "max_gram": 20
            }
         },
         "analyzer": {
            "edge_ngram_analyzer": {
               "type": "custom",
               "tokenizer": "standard",
               "filter": [
                  "lowercase",
                  "edge_ngram_filter"
               ]
            }
         }
      }
   },
   "mappings": {
      "Entity": Entity.mapping,
   },
   frame: {
     "@type": Context.iris.$.Entity
   },
   isOperableDoc,
   mapDoc
};
