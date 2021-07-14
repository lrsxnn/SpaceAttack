import {
    AbstractSDKRequest,
    IRequestOptions,
    IUploadRequestOptions,
    StorageInterface,
    WebSocketContructor,
    SDKAdapterInterface,
    StorageType,
    ResponseObject,
    formatUrl,
} from './AdapterInterface';
import { Game, game, sys } from 'cc';

function isMatch(): boolean {
    if (typeof WebSocket === 'undefined') {
        return false;
    }
    if (typeof XMLHttpRequest === "undefined") {
        return false;
    }

    if (!game) {
        return false;
    }
    if (typeof game.on !== "function") {
        return false;
    }
    if (!Game.EVENT_HIDE) {
        return false;
    }
    if (!Game.EVENT_SHOW) {
        return false;
    }
    if (!sys) {
        return false;
    }
    if (!sys.isNative) {
        return false;
    }
    return true;
}

// declare const cc;

function isFormData(val: any): boolean {
    return Object.prototype.toString.call(val) === '[object FormData]';
}

/**
 * @class WebRequest
 */
class CocosNativeRequest extends AbstractSDKRequest {
    public get(options: IRequestOptions) {
        return this._request({
            ...options,
            method: 'get'
        });
    }
    public post(options: IRequestOptions) {
        return this._request({
            ...options,
            method: 'post'
        });
    }
    public upload(options: IUploadRequestOptions | IRequestOptions) {
        const {
            name,
            data,
            file
        } = options;
        // upload调用data为object类型，在此处转为FormData
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }
        formData.append('key', name);
        formData.append('file', file);
        return this._request({
            ...options,
            data: formData,
            method: 'post'
        });
    }
    /**
     * cocos native平台无法直接用<a>标签触发下载，此处逻辑跟小程序对齐
     * @override
     * @param options
     */
    public download(options: IRequestOptions) {
        return new Promise(resolve => {
            resolve({
                statusCode: 200,
                tempFilePath: options.url
            });
        });
    }
    protected _request(options: IRequestOptions) {
        const method = (String(options.method)).toLowerCase() || 'get';
        return new Promise(resolve => {
            const {
                url,
                headers = {},
                data,
                responseType
            } = options;
            const realUrl = formatUrl('https:', url!, method === 'get' ? data : {});
            const ajax = new XMLHttpRequest();
            ajax.open(method, realUrl);

            responseType && (ajax.responseType = responseType);
            // ajax.setRequestHeader('Accept', 'application/json');
            for (const key in headers) {
                ajax.setRequestHeader(key, headers[key]);
            }

            ajax.onreadystatechange = () => {
                if (ajax.readyState === 4) {
                    const result: ResponseObject = {
                        statusCode: ajax.status
                    };
                    try {
                        // 上传post请求返回数据格式为xml，此处容错
                        result.data = JSON.parse(ajax.responseText);
                    } catch (e) { }

                    resolve(result);
                }
            };
            ajax.send(method === 'post' && isFormData(data) ? (data as FormData) : JSON.stringify(data || {}));
        });
    }
}
const ccStorage: StorageInterface = {
    setItem(key: string, value: any) {
        sys.localStorage.setItem(key, value);
    },
    getItem(key: string): any {
        return sys.localStorage.getItem(key);
    },
    removeItem(key: string) {
        sys.localStorage.removeItem(key);
    },
    clear() {
        sys.localStorage.clear();
    }
};

function genAdapter() {
    // cc原生环境无sessionStorage
    const adapter: SDKAdapterInterface = {
        root: window,
        reqClass: CocosNativeRequest,
        wsClass: WebSocket as WebSocketContructor,
        localStorage: ccStorage,
        primaryStorage: StorageType.local
    };
    return adapter;
}

const adapter = {
    genAdapter,
    isMatch,
    runtime: 'cocos_native'
};

// try {
//     window['tcbAdapterCocos'] = adapter;
//     window['adapter'] = adapter;
// } catch (e) { }

export default adapter;