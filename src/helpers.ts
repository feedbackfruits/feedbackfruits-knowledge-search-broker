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
    type: [].concat(doc[Helpers.decodeIRI(Context.type)]).map(Helpers.decodeIRI),
    name: [].concat(doc[Helpers.decodeIRI(Context.name)])[0],
    description: [].concat(doc[Helpers.decodeIRI(Context.description)])[0],
    license: [].concat(doc[Helpers.decodeIRI(Context.license)])[0],
    sourceOrganization: [].concat(doc[Helpers.decodeIRI(Context.sourceOrganization)])[0],
    entities: doc[Helpers.decodeIRI(Context.about)].map(Helpers.decodeIRI).map((id: string) => ({ id }))
  };
}
