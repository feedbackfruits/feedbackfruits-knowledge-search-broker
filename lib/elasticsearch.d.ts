export declare const mapping: {
    "settings": {
        "analysis": {
            "filter": {
                "edge_ngram_filter": {
                    "type": string;
                    "min_gram": number;
                    "max_gram": number;
                };
            };
            "analyzer": {
                "edge_ngram_analyzer": {
                    "type": string;
                    "tokenizer": string;
                    "filter": string[];
                };
            };
        };
    };
    "mappings": {
        "entity": {
            "properties": {
                "name": {
                    "type": string;
                    "analyzer": string;
                    "search_analyzer": string;
                };
                "count": {
                    "type": string;
                };
            };
        };
    };
};
export declare function createIndex(): Promise<{}>;
export declare function indexExists(): Promise<{}>;
export declare function index(type: any, docs: any): Promise<void> | Promise<{}>;
export declare const client: any;
export default client;
