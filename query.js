const Config = require('./lib/config');
const fetch = require('node-fetch');

const { ELASTICSEARCH_ADDRESS, ELASTICSEARCH_INDEX_NAME } = Config;

const query = {
  size: 100,
  query: {
    nested: {
      path: "about",
      query: {
        function_score: {
          query: {
            terms: {
              "about.id": [ "http://dbpedia.org/resource/Linear_algebra" ]
            }
          },
          field_value_factor: {
            field: 'about.score'
          }
        }
      }
    }

    // function_score: {
    //   query: {
    //     terms: {
    //       "about.id": [ "http://dbpedia.org/resource/Linear_algebra" ],
    //     }
    //   },
    //   // field_value_factor: {
    //   //   field: 'about.score'
    //   // }
    // }

    // match: {
    //   "about.id": "http://dbpedia.org/resource/Linear_algebra"
    // }
    // has_child: {
    //   type: "Annotation",
    //   query: {
    //     terms: {
    //       about: [ annotation["about"] ]
    //     }
    //   }
    // }
  }
};

async function testQuery() {
  const url = `${ELASTICSEARCH_ADDRESS}/${ELASTICSEARCH_INDEX_NAME}_resources_search/Resource/_search`;
  console.log('Testing query against url:', url);
  const resourcePromise = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  });
  const resources = await resourcePromise.json();

  console.log('Response:', resources);

  const result = resources.hits.hits.map(hit => hit._source);

  return result.map(hit => hit["@id"]);
}

testQuery().then(console.log.bind(console), console.error.bind(console));
