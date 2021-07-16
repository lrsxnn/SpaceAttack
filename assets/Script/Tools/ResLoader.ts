import { TimeTake } from './TimeTake';

import { _decorator, Component, Node, resources, error, Asset, Prefab, AudioClip } from 'cc';
const { ccclass } = _decorator;

@ccclass('ResLoader')
export class ResLoader {
    private static dynamic_load_assets: string[];
    /** @param 一次性最大加载资源个数 */
    private static _maxLoad = 1;

    /**
     * 加载游戏常驻资源列表
     */
    public static loadGameStaticResList(list: ResLoadCell[] | null = null, onProgress: Function | null = null, onCompleted: Function | null = null) {
        if (!list || list.length === 0) {
            if (onCompleted) {
                onCompleted();
            }
            return;
        }
        let progress = 0;
        list.forEach(cell => {
            this.loadGameStaticRes(cell.path, cell.type, (item: Asset) => {
                progress++;
                if (onProgress) {
                    onProgress(progress / list.length);
                }

                if ((progress == list.length) && onCompleted) {
                    onCompleted();
                }
            })
        })
    }

    /**
     * 加载游戏常驻资源
     */
    public static loadGameStaticRes(path: string, type: any, onCompleted: Function | null = null) {
        TimeTake.start(path);
        resources.load(path, type, (err, item) => {
            if (err) {
                error(err.message || err);
            } else {
                TimeTake.end(path);
                if (onCompleted) {
                    onCompleted(item);
                }
            }
        })
    }

    /**
     * 加载场景常驻资源列表
     */
    public static loadSceneStaticResList(list: ResLoadCell[] | null = null, onProgress: Function | null = null, onCompleted: Function | null = null) {
        if (!list || list.length == 0) {
            if (onCompleted) {
                onCompleted();
            }
            return;
        }

        let total = list.length;
        let load = 0;

        let loadFunc = () => {
            if (total === load) {
                return;
            }

            let cnt = this._maxLoad;
            let end = load + cnt;
            if (end > total) {
                end = total;
            }
            let tmpList = list?.slice(load, end);
            let tmpLoad = 0;
            tmpList?.forEach(cell => {
                this.preloadSceneStaticRes(cell.path, cell.type, () => {
                    load++;
                    tmpLoad++;
                    if (onProgress) {
                        onProgress(load / total);
                    }

                    if (load === total && onCompleted) {
                        onCompleted();
                        return;
                    }

                    if (tmpLoad === cnt) {
                        loadFunc();
                    }
                })
            })
        }
        loadFunc();
    }

    public static preloadSceneStaticRes(path: string, type: any, onCompleted: Function | null = null) {
        TimeTake.start(path);
        resources.load(path, type, (err, item) => {
            if (err) {
                error(err.message || err);
            } else {
                TimeTake.end(path);
                if (onCompleted) {
                    onCompleted();
                }
            }
        })
    }

    /**
     * 加载预制
     */
    public static loadPrefab(path: string, onCompleted: Function | null = null) {
        resources.load(path, Prefab, (err, prefab) => {
            if (err) {
                error(err.message || err);
            } else {
                // this.dynamic_load_assets.push(prefab._uuid);
                if (onCompleted) {
                    onCompleted(prefab);
                }
            }
        });
    }

    /**
     * 预加载声音
     */
    public static preloadAudioList(audioList: string[] | null = null, onCompleted: Function | null = null) {
        if (audioList && audioList.length > 0) {
            let total = audioList.length;
            let load = 0;
            audioList.forEach(path => {
                resources.load(path, AudioClip, (err, clicp) => {
                    if (err) {
                        error(err.message || err);
                    } else {
                        load++;
                        if (total == load) {
                            if (onCompleted) {
                                onCompleted();
                            }
                        }
                    }
                })
            })
        } else {
            if (onCompleted) {
                onCompleted();
            }
        }
    }
}

export class ResLoadCell {
    public path: string;
    public type: any;
    constructor(path: string, type: any) {
        this.path = path;
        this.type = type;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
