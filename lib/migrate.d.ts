export declare const POLL_INTERVAL = 5000;
export declare function migrate(scriptPerIndex: {
    [key: string]: string;
}): Promise<void>;
export declare function indicesExist(indices: string[]): Promise<{}>;
export declare function versionedIndicesExist(indices: string[]): Promise<{}>;
export declare function reindex(indexName: string, script: string): Promise<{}>;
export declare function taskFinished(task: any): Promise<{}>;
