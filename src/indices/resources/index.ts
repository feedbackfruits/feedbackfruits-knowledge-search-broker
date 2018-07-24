import { Context, Doc } from 'feedbackfruits-knowledge-engine';

import Resource from './resource';
import Tag from './tag';
import Annotation from './annotation';

function isOperableDoc(doc: Doc): boolean {
  return typeFor([].concat(doc["@type"])) != null;
}

function typeFor(types: string[]): string {
  const typeMap = types.reduce((memo, type) => ({ ...memo, [type]: true }), {});
    return  'Resource' in typeMap ? 'Resource' :
            'Tag' in typeMap ? 'Tag' :
            'Annotation' in typeMap ? 'Annotation' : null;
}

function mapDoc(doc: Doc): Doc {
  const type = typeFor([].concat(doc["@type"]));
  if (!(type === 'Resource')) return doc;

  // Calculate relevance

  return {
    ...doc
  };
}

export default {
   "mappings": {
      Resource,
      Tag,
      Annotation,
   },
   frames: [
     {
       "@type": Context.iris.$.Resource
     },
     {
       "@type": Context.iris.$.Tag
     },
     {
       "@type": Context.iris.$.Annotation
     },
  ],
   isOperableDoc,
   mapDoc
};
