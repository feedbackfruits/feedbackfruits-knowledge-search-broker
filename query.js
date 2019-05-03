const Config = require('./lib/config');
const fetch = require('node-fetch');

const { ELASTICSEARCH_ADDRESS, ELASTICSEARCH_INDEX_NAME } = Config;

const query = {
  size: 100,
  _source: false,
  query: {
    match_all: {}
    // nested: {
    //   path: "about",
    //   query: {
    //     function_score: {
    //       query: {
    //         terms: {
    //           "about.id": [ "http://dbpedia.org/resource/Linear_algebra" ]
    //         }
    //       },
    //       field_value_factor: {
    //         field: 'about.score'
    //       }
    //     }
    //   }
    // }

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

async function testQuery(size = 100, scroll_id = null) {
  const query = scroll_id ? { scroll: "5m", scroll_id } : {
    // from,
    size,
    _source: false,
    query: {
      match_all: {}
    }
  };

  const url = scroll_id
    ? `${ELASTICSEARCH_ADDRESS}/_search/scroll`
    : `${ELASTICSEARCH_ADDRESS}/${ELASTICSEARCH_INDEX_NAME}_resources_search/Resource/_search?scroll=5m`;
  // console.log('Testing query against url:', url);
  const resourcePromise = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(query)
  });

  // console.log('Response:', resources);

  try {
    const resourcesText = await resourcePromise.text();
    // console.log(resourcesText);

    const resources = JSON.parse(resourcesText);
    const _scroll_id = resources._scroll_id;
    const result = resources.hits.hits; //.map(hit => hit._source);
    // console.log(_scroll_id);

    return {
      scroll_id: _scroll_id,
      ids: result.map(hit => hit["_id"])
    };
  } catch(e) {
    console.log(resources);
    console.error(e);
  }

}

async function sleep(time) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), time);
  })
}

async function doStuff() {
  console.log('Id');
  // let from = 0;
  const size = 10000;
  let { scroll_id, ids } = await testQuery(size);
  ids.forEach(id => console.log(id));

  while(ids.length > 0) {
    await sleep(1000);
    let res = await testQuery(size, scroll_id);

    scroll_id = res.scroll_id;
    ids = res.ids;

    ids.forEach(id => console.log(id));
  }
}

doStuff();

// testQuery().then(console.log.bind(console), console.error.bind(console));
