import { Entity } from './entity';
import { Resource } from './resource';
export declare function ensureIndex(): Promise<boolean>;
export declare function createIndex(): Promise<{}>;
export declare function indexExists(): Promise<{}>;
export declare function index(type: string, docs: Array<Entity | Resource>): Promise<void>;
export declare const client: any;
export default client;
