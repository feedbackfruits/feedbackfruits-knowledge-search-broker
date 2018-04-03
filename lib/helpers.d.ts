import { Doc } from 'feedbackfruits-knowledge-engine';
import { Entity } from './entity';
import { Resource } from './resource';
export declare function isOperableDoc(doc: Doc): boolean;
export declare function typeFor(types: string[]): string;
export declare function parentFor(original: Doc, childId: string): string;
export declare function flattenDocWithParents(original: Doc): Promise<{
    doc: Doc;
    parent: string | null;
}[]>;
export declare function parentForType(type: string): string;
export declare function docToEntity(doc: Doc): Promise<Entity>;
export declare function docToResource(doc: Doc): Resource;
