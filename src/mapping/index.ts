import Entity from './entity';
import Resource from './resource';
import Tag from './tag';
import Annotation from './annotation';

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
      Resource,
      Tag,
      Annotation,
   }
};
