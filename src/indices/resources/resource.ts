export default {
  // _parent: {
  //   type: "Entity"
  // },
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
     "image": {
       type: "keyword"
     },

     "sourceOrganization": {
        type: "keyword",
     },
     "license": {
        type: "keyword",
     },
     "tags": {
        type: "keyword",
     },
     "annotations": {
       type: "keyword"
     }
  }
};
