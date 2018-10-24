import { Doc } from 'feedbackfruits-knowledge-engine';
declare function isOperableDoc(doc: Doc): boolean;
declare function mapDoc(doc: Doc): Promise<Doc>;
declare const _default: {
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
    isOperableDoc: typeof isOperableDoc;
    mapDoc: typeof mapDoc;
};
export default _default;
