export enum StorageType {
    local = "local",
    none = "none",
    session = "session"
}
export interface ResponseObject {
    data?: any;
    statusCode?: number;
    [key: string]: any;
}
export interface IRequestOptions {
    url?: string;
    data?: object;
    headers?: object;
    method?: string;
    responseType?: XMLHttpRequestResponseType;
    [key: string]: any;
}
export interface IUploadRequestOptions extends IRequestOptions {
    file: string;
    name: string;
    data: {
        success_action_status?: string;
        [key: string]: any;
    };
    onUploadProgress?: (...args: any[]) => void;
}
export interface SDKRequestInterface {
    get?: (options: IRequestOptions) => any;
    post: (options: IRequestOptions) => any;
    upload: (options: IRequestOptions) => any;
    download: (options: IRequestOptions) => any;
}
export abstract class AbstractSDKRequest implements SDKRequestInterface {
    abstract post(options: IRequestOptions): any;
    abstract upload(options: IRequestOptions): any;
    abstract download(options: IRequestOptions): any;
}
export interface NodeRequestInterface {
    send: (action: string, data?: any, ...args: any[]) => Promise<any>;
}
export type SDKRequestConstructor = new (options?: any) => SDKRequestInterface;
export type NodeRequestConstructor = new (options: any) => NodeRequestInterface;
export interface WebSocketInterface {
    send: (data?: string | ArrayBuffer) => void;
    close: (code?: number, reason?: string) => void;
    onopen: any;
    onclose: any;
    onerror: any;
    onmessage: any;
    readyState: number;
    CONNECTING: number;
    OPEN: number;
    CLOSING: number;
    CLOSED: number;
}
export type WebSocketContructor = new (url: string, ...args: any[]) => WebSocketInterface;
export interface StorageInterface {
    setItem: (key: string, value: any) => void;
    getItem: (key: string) => any;
    removeItem?: (key: string) => void;
    clear?: () => void;
    [key: string]: any;
}
export abstract class AbstractStorage implements StorageInterface {
    abstract setItem(key: string, value: any): void;
    abstract getItem(key: string): any;
}
export interface SDKAdapterInterface {
    root: any;
    wsClass: WebSocketContructor;
    reqClass: SDKRequestConstructor;
    localStorage?: StorageInterface;
    sessionStorage?: StorageInterface;
    primaryStorage?: StorageType;
}
export interface NodeAdapterInterface {
    wsClass: WebSocketContructor;
    reqClass: NodeRequestConstructor;
}
export interface CloudbaseAdapter {
    runtime: string;
    isMatch: () => boolean;
    genAdapter: () => SDKAdapterInterface | NodeAdapterInterface;
}

export function formatUrl(protocol: string, url: string, query?: object): string {
    if (query === void 0) { query = {}; }
    var urlHasQuery = /\?/.test(url);
    var queryString = '';
    for (var key in query) {
        if (queryString === '') {
            !urlHasQuery && (url += '?');
        }
        else {
            queryString += '&';
        }
        queryString += key + "=" + encodeURIComponent(query[key]);
    }
    url += queryString;
    if (/^http(s)?\:\/\//.test(url)) {
        return url;
    }
    return "" + protocol + url;
}