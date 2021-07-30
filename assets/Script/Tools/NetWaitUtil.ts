import { NetWait } from './../Prefab/NetWait';

import { _decorator, Node, resources, Prefab, instantiate, game, view, Vec3, error } from 'cc';
import UIMgr from './UIMgr';
const { ccclass } = _decorator;

@ccclass('NetWaitUtil')
class NetWaitUtil {
    private static _instance: NetWaitUtil = null!;
    private _node: Node = null!;
    private _prefabPath = '';
    private _net_wait_tag = '';
    private _net_wait_id: number | null = 0;

    public static instance() {
        if (!this._instance) {
            this._instance = new NetWaitUtil();
        }
        return this._instance;
    }

    constructor() {
        this._prefabPath = 'Prefab/NetWait';
    }

    private getNode(): Node {
        if (!this._node) {
            let prefab: Prefab = resources.get(this._prefabPath, Prefab)!;
            this._node = instantiate(prefab);
            this._node.active = false;
            game.addPersistRootNode(this._node);
        }

        return this._node;
    }

    public close() {
        let node = this.getNode();
        node.active = false;
    }

    public show(text?: string) {
        this.close();
        let node = this.getNode();
        let cpt = node.getComponent(NetWait)!;
        if (typeof text === 'undefined') {
            text = '正在进行网络连接......';
        }
        cpt.show(text);
        node.active = true;
    }

    public netWaitStart(text: string, tag: string) {
        if (this._net_wait_id) {
            clearTimeout(this._net_wait_id);
            this._net_wait_id = null;
        }
        this.close();
        this._net_wait_tag = tag;
        this._net_wait_id = setTimeout(() => {
            this.show(text);
        }, 2000);
    }

    public netWaitEnd(tag: string) {
        if (this._net_wait_tag !== tag) {
            return;
        }
        if (this._net_wait_id) {
            clearTimeout(this._net_wait_id);
            this._net_wait_id = null;
        }
        this.close();
    }
}

export default NetWaitUtil.instance();

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
