import { ResLoader, ResLoadCell } from './../Tools/ResLoader';

import { _decorator, Component, Node, Prefab, ProgressBar, Label, resources, error } from 'cc';
import SceneManagerUtil from '../Tools/SceneManagerUtil';
const { ccclass, property } = _decorator;

@ccclass('PreLoadingScene')
export class PreLoadingScene extends Component {
    @property(ProgressBar)
    progress: ProgressBar = null!;
    @property(Label)
    label: Label = null!;

    onLoad() {
        this.progress.progress = 0.01;
        this.label.string = "0%";
    }

    start() {
        let list: ResLoadCell[] = [];
        list.push(new ResLoadCell('Prefab/NetWait', Prefab));
        list.push(new ResLoadCell('Prefab/PromptBox', Prefab));

        ResLoader.loadGameStaticResList(list, this.onProgress.bind(this), () => {
            SceneManagerUtil.replaceScene('GameScene');
        });
    }

    private onProgress(value: number) {
        let pre = Math.floor(value * 100);
        this.progress.progress = value > 0.01 ? value : 0.01;
        if (isNaN(pre)) {
            pre = 100;
        }
        this.label.string = `加载资源${pre}%`;
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
