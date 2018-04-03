export default {
   properties: {
      // _parent: {
      //   type: "Entity"
      // },
      ac_name: {
         type: "text",
         analyzer: "edge_ngram_analyzer",
         search_analyzer: "english"
      },
      count: {
        type: "integer"
      }
   }
}
