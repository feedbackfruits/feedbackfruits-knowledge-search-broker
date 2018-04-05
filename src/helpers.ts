import { Doc, Helpers, Context } from 'feedbackfruits-knowledge-engine';

import { Entity, getCount } from './entity';
import { Resource } from './resource';

import indices from './indices';

// export function isOperableDoc(doc: Doc): boolean {
//   return typeFor([].concat(doc["@type"])) != null;
// }

export function typeFor(types: string[]): string {
  const typeMap = types.reduce((memo, type) => ({ ...memo, [type]: true }), {});
    return  'Resource' in typeMap ? 'Resource' :
            'Entity' in typeMap ? 'Entity' :
            'Tag' in typeMap ? 'Tag' :
            'Annotation' in typeMap ? 'Annotation' : null;
}

export function parentFor(original: Doc, childId: string): string {
  // console.log(`Looking for ${childId} in ${original["@id"]}`);
  // If the child we are looking for is the top-level, we have no parent.
  if (original["@id"] === childId) return null;

  const properties = Object.keys(original);
  return properties.reduce((memo, p) => {
    // This should stop the recursion if a parent is found...
    if (memo) return memo;

    const value = original[p];

    // Check arrays of things
    if (value instanceof Array) {
      // console.log(`Checking array value of property ${p}`);
      return value.reduce((memo, child) => {
        if (memo) return memo;
        if (typeof child !== 'object') return null; // We don't have to check arrays with native values
        if (child["@id"] == childId) return original["@id"]; // If we've found the child, we're done!
        else {
          const maybeParent = parentFor(value, childId); // If not, maybe it's nested deeper...
          return maybeParent != null ? maybeParent : null; // Or maybe not...
        }
      }, memo);
    }
    else if (typeof value === 'object') { // The child might be a singular relationship/owl functional property
      if (typeof value !== 'object') return null; // We don't have to check native values
      if (value["@id"] === childId) return original["@id"];
      else { // Or a nested child of a functional property
        const maybeParent = parentFor(value, childId);
        return maybeParent != null ? maybeParent : null;
      }
    }

    return null; // Or, it's not there.
  }, null);
}

export async function flattenDocWithParents(original: Doc): Promise<{ doc: Doc, parent: string | null }[]> {
  const compacted = await Doc.compact(original, Context.context);
  const flattened = await Doc.flatten(compacted, Context.context);

  const parentByDoc = flattened.reduce((memo, doc) => {
    // if (!isOperableDoc(doc)) return memo;
    const id = doc["@id"];
    const parentId = parentFor(compacted, id);

    return {
      ...memo,
      [id]: parentId
    };
  }, {});

  return flattened.map(doc => {
    const parent = parentByDoc[doc["@id"]];
    return {
      doc,
      parent
    };
  })
}

export function parentTypeForType(index: string, type: string): string {
  return (`${type}` in indices[index].mappings && "_parent" in indices[index].mappings[type]) ? indices[index].mappings[type]._parent.type : null;
}

// export async function docToEntity(doc: Doc): Promise<Entity> {
//   const count = await getCount(doc);
//   return {
//     "@id": doc['@id'],
//     name: doc['name'],
//     count
//   };
// }
