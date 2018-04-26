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

export function parentFor(original: Doc, childIds: object): object {
  const res = { ...childIds };

  // console.log(`Looking for ${childId} in ${original["@id"]}`);
  // If one of the children we are looking for is the top-level, it has no parent.
  if (original["@id"] in res) res[original["@id"]] = null;

  const properties = Object.keys(original);
  return properties.reduce((memo, p) => {
    const value = original[p];

    // Check arrays of things
    if (value instanceof Array) {
      // console.log(`Checking array value of property ${p}`);
      return value.reduce((memo, child) => {
        if (typeof child !== 'object') return memo; // We don't have to check arrays with native values
        if (child["@id"] in memo) {
          memo[child["@id"]] = original["@id"]; // If we've found a child, store its parent
          return memo;
        }
        else {
          return parentFor(value, memo); // If not, maybe it's nested deeper...
          // return maybeParent != null ? maybeParent : null; // Or maybe not...
        }
      }, memo);
    }
    else if (typeof value === 'object') { // The child might be a singular relationship/owl functional property
      if (typeof value !== 'object') return memo; // We don't have to check native values
      if (value["@id"] in memo) {
        memo[value["@id"]] = original["@id"];
        return memo;
      }
      else { // Or a nested child of a functional property
          return parentFor(value, memo); // If not, maybe it's nested deeper...
      }
    }

    return memo; // Or, it's not there.
  }, res);
}

export async function flattenDocWithParents(original: Doc): Promise<{ doc: Doc, parent: string | null }[]> {
  const compacted = await Doc.compact(original, Context.context);
  const flattened = await Doc.flatten(compacted, Context.context);

  const ids = flattened.reduce((memo, x) => ({ ...memo, [x["@id"]]: undefined }), {});
  const parentByDoc = parentFor(compacted, ids);
  // const parentByDoc = flattened.reduce((memo, doc) => {
  //   // if (!isOperableDoc(doc)) return memo;
  //   const id = doc["@id"];
  //   const parentId = parentFor(compacted, id);
  //
  //   return {
  //     ...memo,
  //     [id]: parentId
  //   };
  // }, {});

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
