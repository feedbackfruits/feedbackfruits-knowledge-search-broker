import { Doc } from 'feedbackfruits-knowledge-engine';
import * as DataLoader from 'dataloader';
export declare function createIndices(): Promise<{}[]>;
export declare function updateAlias(alias: any, index: any): Promise<{}>;
export declare function updateIndexingAliases(): Promise<{}[]>;
export declare function updateSearchAliases(): Promise<{}[]>;
export declare function reindexFromSearchAlias(): Promise<{}[]>;
export declare const loader: DataLoader<any, any>;
export declare function index(docs: Array<{
    index: string;
    doc: Doc;
    parent: string | null;
}>): Promise<void>;
export declare const client: any;
export default client;
