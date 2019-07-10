import { Doc } from 'feedbackfruits-knowledge-engine';
import * as DataLoader from 'dataloader';
export declare function createIndices(): Promise<unknown[]>;
export declare function updateAlias(alias: any, index: any): Promise<unknown>;
export declare function updateIndexingAliases(): Promise<unknown[]>;
export declare function updateSearchAliases(): Promise<unknown[]>;
export declare function reindexFromSearchAlias(): Promise<unknown[]>;
export declare const loader: DataLoader<any, any>;
export declare function index(docs: Array<{
    index: string;
    doc: Doc;
    parent: string | null;
}>): Promise<void>;
export declare const client: any;
export default client;
