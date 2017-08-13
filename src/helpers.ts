import { Doc, Helpers } from 'feedbackfruits-knowledge-engine';
import * as Context from 'feedbackfruits-knowledge-context';

import { Entity } from './entity';
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

export function docToEntity(doc: Doc): Entity {
  return {
    id: doc['@id'],
    name: doc[Helpers.decodeIRI(Context.name)],
  };
}

export function docToResource(doc: Doc): Resource {
  return {
    id: doc['@id'],
    name: doc[Helpers.decodeIRI(Context.name)],
    entities: doc[Helpers.decodeIRI(Context.about)].map(Helpers.decodeIRI).map(id => ({ id }))
  };
}
