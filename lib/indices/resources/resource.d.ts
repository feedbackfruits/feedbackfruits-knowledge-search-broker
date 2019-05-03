import { Doc } from 'feedbackfruits-knowledge-engine';
import { FeaturesObj } from '..';
export declare function getFeatures(doc: Doc): Promise<FeaturesObj>;
export declare const mapping: {
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
        topic: {
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
export default mapping;
