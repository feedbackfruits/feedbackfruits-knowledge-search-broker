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
        entity: {
            properties: {
                name: {
                    type: string;
                    analyzer: string;
                    search_analyzer: string;
                };
                count: {
                    type: string;
                };
            };
        };
        resource: {
            properties: {
                id: {
                    type: string;
                };
                type: {
                    type: string;
                };
                sourceOrganization: {
                    type: string;
                };
                license: {
                    type: string;
                };
                "entities.id": {
                    type: string;
                };
            };
        };
    };
};
export default _default;
