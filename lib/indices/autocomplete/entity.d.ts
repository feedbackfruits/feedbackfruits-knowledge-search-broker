import { Doc } from 'feedbackfruits-knowledge-engine';
import { FeaturesObj } from '..';
export declare function entityIdToName(entityId: string): string;
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
            analyzer: string;
            search_analyzer: string;
        };
        resourceCount: {
            type: string;
        };
    };
};
export default mapping;
