import { PromptBox } from './../Prefab/PromptBox';
import { _decorator, Node, NodePool, resources, Prefab, instantiate, game, find, UITransform, Vec2, view, SpriteFrame, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('PromptBoxUtil')
class PromptBoxUtil {
    private static _instance: PromptBoxUtil = null!;
    private _promptBoxPool: NodePool = null!;
    private _prefabPath = '';
    private _popList: Node[] = [];
    private _popHeight = 0;

    constructor() {
        this._prefabPath = 'Prefab/PromptBox';
        this._popList = [];
    }

    public static instance(): PromptBoxUtil {
        if (!this._instance) {
            this._instance = new PromptBoxUtil();
        }
        return this._instance;
    }

    /**
     * 创建对象池
     */
    private createPromptBoxPool() {
        this._promptBoxPool = new NodePool();
        let prefab: Prefab = resources.get(this._prefabPath, Prefab)!;
        for (let i = 0; i < 5; i++) {
            let node = instantiate(prefab);
            this._promptBoxPool.put(node);
            game.addPersistRootNode(node);
            node.active = false;
            this._popHeight = find('bg', node)!.getComponent(UITransform)!.height;
        }
    }

    /**
     * 获取视图节点
     */
    private getNode(): Node {
        if (!this._promptBoxPool) {
            this.createPromptBoxPool();
        }

        if (this._promptBoxPool.size() == 0) {
            let prefab: Prefab = resources.get(this._prefabPath, Prefab)!;
            let node = instantiate(prefab);
            this._promptBoxPool.put(node);
            game.addPersistRootNode(node);
            node.active = false;
        }
        let node = this._promptBoxPool.get()!;
        return node;
    }

    /**
     * 显示视图
     */
    public show(text: string, bgSpf: SpriteFrame | null = null, len: number | null = null, bgwidth: number | null = null) {
        let num = len ? len : 5;
        if (this._popList.length >= num) {
            return;
        }
        let node = this.getNode();
        node.active = true;
        this._popList.push(node);
        let cpt = node.getComponent(PromptBox)!;
        cpt.addViewCloseListener(() => {
            this.removePopItem(node);
            this._promptBoxPool.put(node);
            game.addPersistRootNode(node);
            node.active = false;
        });

        let tarPos = this.getTargetPos(this._popList.length - 1);
        cpt.show(text, bgSpf, tarPos, bgwidth);
        let size = view.getDesignResolutionSize();
        let pos = new Vec3();
        pos.x = size.width / 2;
        pos.y = Math.min(size.height / 2, tarPos.y);
        node.setPosition(pos);
    }

    private removePopItem(node: Node) {
        for (let i = 0; i < this._popList.length; i++) {
            if (this._popList[i] === node) {
                this._popList.splice(i, 1);
                break;
            }
        }
        this._popList.forEach((node, index) => {
            node.getComponent(PromptBox)!.changeMove(this.getTargetPos(index));
        })
    }

    private getTargetPos(index: number): Vec2 {
        let topPos = Vec2.ZERO.clone();
        let size = view.getDesignResolutionSize();
        topPos.x = size.width / 2;
        topPos.y = size.height / 4 * 3;
        topPos.y -= index * this._popHeight;
        return topPos;
    }
}

export default PromptBoxUtil.instance();
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
