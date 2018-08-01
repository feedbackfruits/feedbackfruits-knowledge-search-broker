declare const _default: {
    autocomplete: {
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
        isOperableDoc: (doc: object) => boolean;
        mapDoc: (doc: object) => Promise<object>;
    };
    resources: {
        "mappings": {
            Resource: {
                properties: {
                    id: {
                        type: string;
                    };
                    type: {
                        type: string;
                    };
                    name: {
                        type: string;
                    };
                    description: {
                        type: string;
                    };
                    image: {
                        type: string;
                    };
                    encoding: {
                        type: string;
                    };
                    sourceOrganization: {
                        type: string;
                    };
                    license: {
                        type: string;
                    };
                    tags: {
                        type: string;
                    };
                    annotations: {
                        type: string;
                    };
                };
            };
            Tag: {
                _parent: {
                    type: string;
                };
                properties: {
                    "about": {
                        type: string;
                    };
                    score: {
                        type: string;
                    };
                };
            };
            Annotation: {
                properties: {
                    "startPosition": {
                        type: string;
                    };
                    "confidence": {
                        type: string;
                    };
                    "detectedAs": {
                        type: string;
                    };
                    "about": {
                        type: string;
                    };
                    score: {
                        type: string;
                    };
                };
                _parent: {
                    type: string;
                };
            };
        };
        frames: {
            "@type": string;
        }[];
        isOperableDoc: (doc: object) => boolean;
        mapDoc: (doc: object) => object;
    };
};
export default _default;
