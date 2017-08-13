import entity from './entity';
import resource from './resource';

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
      entity,
      resource
   }
};
