import { Doc } from 'feedbackfruits-knowledge-engine';
import { Entity } from './entity';
import { Resource } from './resource';
export declare function isEntityDoc(doc: Doc): boolean;
export declare function isResourceDoc(doc: Doc): boolean;
export declare function isOperableDoc(doc: Doc): boolean;
export declare function docToEntity(doc: Doc): Promise<Entity>;
export declare function docToResource(doc: Doc): Resource;
