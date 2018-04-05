import { Doc } from 'feedbackfruits-knowledge-engine';
export declare function ensureIndices(): Promise<boolean>;
export declare function createIndices(): Promise<{}[]>;
export declare function indicesExist(): Promise<{}>;
export declare function index(docs: Array<{
    index: string;
    doc: Doc;
    parent: string | null;
}>): Promise<void>;
export declare const client: any;
export default client;
