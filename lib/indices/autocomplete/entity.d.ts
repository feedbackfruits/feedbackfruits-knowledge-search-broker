import { Doc } from 'feedbackfruits-knowledge-engine';
export declare type FeaturesObj = {
    [key: string]: any;
};
export declare function getFeatures(doc: Doc): Promise<FeaturesObj>;
export declare const mapping: {
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
export default mapping;
