export declare type Resource = {
    id: string;
    name: string;
    description: string;
    license: string;
    type: Array<string>;
    sourceOrganization: string;
    entities: Array<{
        id: string;
    }>;
};
