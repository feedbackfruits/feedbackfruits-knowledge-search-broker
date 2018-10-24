export declare type FeaturesObj = {
    [key: string]: any;
};
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
                    about: {
                        type: string;
                        properties: {
                            id: {
                                type: string;
                            };
                            score: {
                                type: string;
                            };
                            explicitlyMentioned: {
                                type: string;
                            };
                        };
                    };
                };
            };
        };
        frames: {
            "@type": string;
        }[];
        isOperableDoc: (doc: object) => boolean;
        mapDoc: (doc: object) => Promise<object>;
    };
};
export default _default;
