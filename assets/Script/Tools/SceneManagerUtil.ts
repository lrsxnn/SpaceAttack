import { TimeTake } from './TimeTake';
import { ResLoader, ResLoadCell } from './ResLoader';
import { NotificationCenter } from './../Notification/NotificationCenter';

import { _decorator, Node, director, Scene, log, find, sys } from 'cc';
import NetWaitUtil from './NetWaitUtil';
const { ccclass } = _decorator;

@ccclass('SceneManagerUtil')
class SceneManagerUtil {
    private static _instance: SceneManagerUtil = null!;
    public static instance() {
        if (!this._instance) {
            this._instance = new SceneManagerUtil();
        }
        return this._instance;
    }

    /**
     * 获取当前场景
     */
    public getCurrentScene(): Scene | null {
        return director.getScene();
    }

    private stack(sceneName: string) {
        let e = new Error();
        let lines = e.stack?.split('\n');
        lines?.shift();
        let str = `加载场景:${sceneName}\n`;
        lines?.forEach(item => {
            str += `${item}\n`;
        });
        log(str);
    }

    public replaceScene(sceneName: string, resList: ResLoadCell[] | null = null, audioList: string[] | null = null, endcall: Function | null = null, resLoadSuccess: Function | null = null) {
        this.stack(sceneName);
        if (!director.getScene() || !director.getScene()?.name) {
            return;
        }
        if (director.getScene()?.name === sceneName) {
            log(`正在${sceneName}场景中，无需切换`);
            return;
        }

        this.replaceSceneWithoutLoading(sceneName, resList, audioList, endcall, resLoadSuccess);
    }

    private replaceSceneWithoutLoading(sceneName: string, resList: ResLoadCell[] | null = null, audioList: string[] | null = null, endcall: Function | null = null, resLoadSuccess: Function | null = null) {
        if (!director.getScene() || !director.getScene()?.name) {
            return;
        }
        if (director.getScene()?.name === sceneName) {
            log(`正在${sceneName}场景中，无需切换`);
            return;
        }

        let scene = director.getScene()!;
        let canvas = scene.getChildByName('Canvas');
        scene.autoReleaseAssets = true;

        NotificationCenter.blockNotifications();
        // AudioManager.clearBackGroundMusicKey();
        NetWaitUtil.show('正在切换场景');
        ResLoader.preloadAudioList(audioList, () => {
            ResLoader.loadSceneStaticResList(resList, null, () => {
                if (resLoadSuccess) {
                    resLoadSuccess();
                }

                TimeTake.start(`加载场景${sceneName}`);
                director.loadScene(sceneName, () => {
                    TimeTake.end(`加载场景${sceneName}`);
                    if(sys.isMobile && sys.isNative){
                        log(`执行GC`);
                    }

                    NetWaitUtil.close();
                    if(endcall){
                        endcall();
                    }

                    NotificationCenter.unBlockNotifications();
                })
            })
        })
    }
}

export default SceneManagerUtil.instance();

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
