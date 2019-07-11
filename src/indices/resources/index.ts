import { Context, Doc } from 'feedbackfruits-knowledge-engine';

import * as Resource from './resource';

function isOperableDoc(doc: Doc): boolean {
  return typeFor([].concat(doc["@type"])) != null;
}

function typeFor(types: string[]): string {
  const typeMap = types.reduce((memo, type) => ({ ...memo, [type]: true }), {});
  return 'Resource' in typeMap ? 'Resource' : null;
}

function filterDoc(doc: Doc): Doc {
  const allowedKeys = Object.keys(Resource.mapping.properties).reduce((memo, key) => ({ ...memo, [key]: true }), {});
  return Object.entries(doc).reduce((memo, [ key, value ]) => {
    return {
      ...memo,
      ...( key in allowedKeys ? { [key]: value } : {})
    }
  }, {});
}

async function mapDoc(doc: Doc): Promise<Doc> {
  const type = typeFor([].concat(doc["@type"]));
  if (!(type === 'Resource')) return doc;
  if (!("tag" in doc || "annotation" in doc)) return doc;

  const features = await Resource.getFeatures(doc);

  return filterDoc({
    id: doc["@id"],
    type: doc["@type"],

    ...doc,
    ...features
  });
}

export default {
   "mappings": {
      Resource: Resource.mapping,
   },
   frames: [
     {
       "@type": Context.iris.$.Resource
     },
  ],
   isOperableDoc,
   mapDoc
};
