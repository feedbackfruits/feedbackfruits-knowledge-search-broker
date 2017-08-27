import { Doc, Helpers } from 'feedbackfruits-knowledge-engine';
import * as Context from 'feedbackfruits-knowledge-context';

import { Entity, getCount } from './entity';
import { Resource } from './resource';

export function isEntityDoc(doc: Doc): boolean {
  return (doc[Helpers.decodeIRI(Context.type)].indexOf(Context.Knowledge.Entity) > -1);
}

export function isResourceDoc(doc: Doc): boolean {
  return (doc[Helpers.decodeIRI(Context.type)].indexOf(Context.Knowledge.Resource) > -1);
}

export function isOperableDoc(doc: Doc): boolean {
  return isEntityDoc(doc) || isResourceDoc(doc);
}

export async function docToEntity(doc: Doc): Promise<Entity> {
  const count = await getCount(doc);
  return {
    id: doc['@id'],
    name: doc[Helpers.decodeIRI(Context.name)],
    count
  };
}

export function docToResource(doc: Doc): Resource {
  return {
    id: doc['@id'],
    name: [].concat(doc[Helpers.decodeIRI(Context.name)])[0],
    entities: doc[Helpers.decodeIRI(Context.about)].map(Helpers.decodeIRI).map((id: string) => ({ id }))
  };
}
