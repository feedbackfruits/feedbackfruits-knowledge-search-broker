export default {
   properties: {
      name: {
         type: "text",
         analyzer: "edge_ngram_analyzer",
         search_analyzer: "english"
      },
      count: {
        type: "integer"
      }
   }
}