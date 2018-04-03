import { Doc } from 'feedbackfruits-knowledge-engine';
export declare function ensureIndex(): Promise<boolean>;
export declare function createIndex(): Promise<{}>;
export declare function indexExists(): Promise<{}>;
export declare function index(docs: Array<{
    doc: Doc;
    parent: string | null;
}>): Promise<void>;
export declare const client: any;
export default client;
