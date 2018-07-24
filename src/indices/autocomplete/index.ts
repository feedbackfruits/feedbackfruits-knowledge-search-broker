import { Context, Doc } from 'feedbackfruits-knowledge-engine';

import Entity from './entity';

function isOperableDoc(doc: Doc): boolean {
  return typeFor([].concat(doc["@type"])) != null;
}

function typeFor(types: string[]): string {
  const typeMap = types.reduce((memo, type) => ({ ...memo, [type]: true }), {});
    return  'Entity' in typeMap ? 'Entity' : null;
}

function mapDoc(doc: Doc): Doc {
  return doc;
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
      Entity,
   },
   frame: {
     "@type": Context.iris.$.Entity
   },
   isOperableDoc,
   mapDoc
};
