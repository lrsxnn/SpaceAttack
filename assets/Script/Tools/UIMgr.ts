import { ResLoader } from './ResLoader';
import { Tag } from './Tag';

import { _decorator, Node, find, log, resources, Prefab, UITransform, Vec3, tween, instantiate, error, sys, warn } from 'cc';
import { SpaceAttack } from './Tools';
const { ccclass } = _decorator;

const TAG_NONE = 0;
const TAG_CLOSE = 1;
const TAG_DESTROY = 2;

@ccclass('UIMgr')
class UIMgr {
    private static s_uimgr: UIMgr = null!;
    public static instance() {
        if (!this.s_uimgr) {
            this.s_uimgr = new UIMgr();
        }
        return this.s_uimgr;
    }

    /**
     * 关闭UI
     */
    public closeUI(prefabNameOrNode: string | Node) {
        if (typeof prefabNameOrNode === 'string') {
            let name = this.path2name(prefabNameOrNode);
            let ui = this.getUI(name);
            if (ui) {
                let tag = ui.getComponent(Tag);
                if (!tag) {
                    tag = ui.addComponent(Tag);
                }
                tag.tag = TAG_CLOSE;
                log(`关闭UI:${name}`);
                let func = () => {
                    if (tag) {
                        tag.tag = TAG_NONE;
                    }
                    if (ui) {
                        ui.active = false;
                    }
                }
                this.showActB2S(ui, func);
            }
        } else {
            if (prefabNameOrNode instanceof Node) {
                log(`关闭UI:${prefabNameOrNode.name}`);
                let tag = prefabNameOrNode.getComponent(Tag);
                if (!tag) {
                    tag = prefabNameOrNode.addComponent(Tag);
                }
                tag.tag = TAG_CLOSE;
                let func = () => {
                    if (tag) {
                        tag.tag = TAG_NONE;
                    }
                    if (prefabNameOrNode) {
                        prefabNameOrNode.active = false;
                    }
                }
                this.showActB2S(prefabNameOrNode, func);
            }
        }
    }

    /**
     * 销毁UI
     */
    public destroyUI(prefabNameOrNode: string | Node) {
        if (typeof prefabNameOrNode === 'string') {
            let name = this.path2name(prefabNameOrNode);
            let ui = this.getUI(name);
            if (ui) {
                let tag = ui.getComponent(Tag);
                if (!tag) {
                    tag = ui.addComponent(Tag);
                }
                tag.tag = TAG_DESTROY;
                log(`销毁UI:${name}`);
                let func = () => {
                    if (tag) {
                        tag.tag = TAG_NONE;
                    }
                    if (ui) {
                        ui.destroy();
                    }
                }
                this.showActB2S(ui, func);
            }
        } else {
            if (prefabNameOrNode instanceof Node) {
                log(`销毁UI:${prefabNameOrNode.name}`);
                let tag = prefabNameOrNode.getComponent(Tag);
                if (!tag) {
                    tag = prefabNameOrNode.addComponent(Tag);
                }
                tag.tag = TAG_DESTROY;
                let func = () => {
                    if (tag) {
                        tag.tag = TAG_NONE;
                    }
                    if (prefabNameOrNode) {
                        prefabNameOrNode.destroy();
                    }
                }
                this.showActB2S(prefabNameOrNode, func);
            }
        }
    }

    /**
     * 获取UI
     */
    public getUI(path: string): Node | null {
        let canvas = find('Canvas');
        if (canvas === null) {
            return null;
        }
        let name = this.path2name(path);
        return canvas.getChildByName(name);
    }

    /**
     * 打开UI
     */
    public openUI(path: string, onOpen: Function | null = null): Node | null {
        let name = this.path2name(path);
        let ui = this.getUI(name);
        if (ui) {
            log(`打开UI:${name}`);
            let tag = ui.getComponent(Tag);
            if (tag && (tag.tag == TAG_CLOSE || tag.tag == TAG_DESTROY)) {
                if (ui.getChildByName('actNode')) {
                    tween(ui.getChildByName('actNode')).stop();
                }
                tag.tag = TAG_NONE;
            }
            ui.active = true;
            if (onOpen) {
                onOpen(ui);
            }
            this.showActS2B(ui);
            return ui;
        } else {
            let prefab = resources.get(path, Prefab);
            if (prefab) {
                ui = instantiate(prefab);
                let canvas = find('Canvas');
                if (canvas === null) {
                    return null;
                }
                ui.parent = canvas;
                SpaceAttack.SysTools.resizeByScreenSize(ui.getComponent(UITransform)!, true);
                ui.name = name;
                log(`打开UI by resourcse:${name}`);
                if (onOpen) {
                    onOpen(ui);
                }
                this.showActS2B(ui);
                return ui;
            } else {
                ResLoader.loadPrefab(path, (prefab: Prefab) => {
                    log(`加载UI:${name}`);
                    let ui = this.getUI(name);
                    if (!ui) {
                        ui = instantiate(prefab);
                        let canvas = find('Canvas');
                        if (canvas === null) {
                            return null;
                        }
                        ui.parent = canvas;
                        SpaceAttack.SysTools.resizeByScreenSize(ui.getComponent(UITransform)!, true);
                        ui.name = name;
                        log(`打开UI by 加载:${name}`);
                    }
                    if (onOpen) {
                        onOpen(ui);
                    }
                    this.showActS2B(ui);
                })
                return null;
            }
        }
    }

    /**
     * path转name
     */
    private path2name(path: string): string {
        let idx = path.lastIndexOf('/');
        if (idx !== -1) {
            path = path.substring(idx + 1);
        }
        return path;
    }

    /**
     * 从小变大特效
     */
    private showActS2B(ui: Node) {
        if (ui) {
            let actNode = ui.getChildByName('actNode');
            if (actNode) {
                actNode.setScale(new Vec3(0.5, 0.5, 0.5));
                tween(actNode).delay(0.05).to(0.15, { scale: new Vec3(1, 1, 1) }).union().start();
            }
        }
    }

    /**
     * 从大变小特效
     */
    private showActB2S(node: Node, callFunc: Function) {
        if (node) {
            let actNode = node.getChildByName('actNode');
            if (actNode) {
                actNode.setScale(new Vec3(1, 1, 1));
                tween(actNode).delay(0.05).to(0.15, { scale: new Vec3(0.5, 0.5, 0.5) }).call(() => {
                    if (callFunc) {
                        callFunc();
                    }
                }).union().start();
            } else {
                if (callFunc) {
                    callFunc();
                }
            }
        } else {
            if (callFunc) {
                callFunc();
            }
        }
    }

    /**
     * 更新UI
     */
    public updateUI(path: string, cpt_name: string, func: Function, args: any) {
        let node = find(path);
        if (node === null) {
            warn(`updateUI 不存在节点 ${path}`);
            return;
        }
        let cpt = node.getComponent(cpt_name);
        if (cpt === null) {
            warn(`updateUI 不存在组件 ${cpt_name}`);
        }
        func.apply(cpt, args);
    }
}

export default UIMgr.instance();

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
