import { Doc } from 'feedbackfruits-knowledge-engine';
export declare function typeFor(types: string[]): string;
export declare function parentFor(original: Doc, childIds: object): object;
export declare function flattenDocWithParents(original: Doc): Promise<{
    doc: Doc;
    parent: string | null;
}[]>;
export declare function parentTypeForType(index: string, type: string): string;
