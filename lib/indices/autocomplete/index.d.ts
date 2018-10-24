import { Doc } from 'feedbackfruits-knowledge-engine';
declare function isOperableDoc(doc: Doc): boolean;
declare function mapDoc(doc: Doc): Promise<Doc>;
declare const _default: {
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
        "Entity": {
            properties: {
                id: {
                    type: string;
                };
                type: {
                    type: string;
                };
                name: {
                    type: string;
                    analyzer: string;
                    search_analyzer: string;
                };
                resourceCount: {
                    type: string;
                };
            };
        };
    };
    frame: {
        "@type": string;
    };
    isOperableDoc: typeof isOperableDoc;
    mapDoc: typeof mapDoc;
};
export default _default;
