import { Doc } from 'feedbackfruits-knowledge-engine';
declare function isOperableDoc(doc: Doc): boolean;
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
    isOperableDoc: typeof isOperableDoc;
};
export default _default;
