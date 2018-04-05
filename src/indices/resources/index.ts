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

export default {
   "mappings": {
      Resource,
      Tag,
      Annotation,
   },
   frame: {
     "@type": Context.iris.$.Resource
   },
   isOperableDoc
};
