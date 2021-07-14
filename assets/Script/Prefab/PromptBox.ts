
import { _decorator, Component, Node, CCFloat, SpriteFrame, find, Sprite, UITransform, Vec2, Label, Animation, tween, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PromptBox')
export class PromptBox extends Component {
    @property({ type: CCFloat, tooltip: '提示框显示的持续时间' })
    duration: number = 1;
    @property
    uptime = 1;

    private _closeViewCallback: Function = null!;

    private _baseBgFrame: SpriteFrame = null!;
    private _baseBgWidth: number = 0;
    private _target_pos: Vec2 | null = null;
    private _curTime: number | null = -1;
    private _isMove = false;

    onLoad() {
        this._baseBgFrame = find('bg', this.node)!.getComponent(Sprite)!.spriteFrame!;
        this._baseBgWidth = find('bg', this.node)!.getComponent(UITransform)!.width;
    }

    update(dt: number) {
        if (this._curTime !== null) {
            if (this._curTime >= this.uptime) {
                this._isMove = false;
            } else {
                let pos = this.node.position.clone();
                pos.x += (this._target_pos!.x - pos.x) * (dt / (this.uptime - this._curTime));
                pos.y += (this._target_pos!.y - pos.x) * (dt / (this.uptime - this._curTime));
                this.node.setPosition(pos);
            }
            this._curTime += dt;
        }
    }

    public show(text: string, bgFrame: SpriteFrame | null, tarPos: Vec2 | null, bgWidth: number | null) {
        let bgNode = find('bg', this.node)!;
        if (bgFrame) {
            bgNode.getComponent(Sprite)!.spriteFrame = bgFrame;
        }

        let lblNodt = find('lbl', bgNode)!;
        let lblCpt = lblNodt.getComponent(Label)!;
        lblCpt.string = text;
        if (bgWidth) {
            bgNode.getComponent(UITransform)!.width = bgWidth;
        }

        let ani = this.node.getComponent(Animation)!;
        ani.play('PromptBoxStart');

        if (tarPos) {
            this._target_pos = tarPos;
            this._curTime = 0;
            this._isMove = true;
        }
    }

    public changeMove(pos: Vec2) {
        let quickTime = 0.1;
        if (!this._isMove) {
            tween(this.node).to(quickTime, { position: new Vec3(pos.x, pos.y, 0) }).start();
        } else {
            this._target_pos = pos;
        }
    }

    public actInFinished() {
        this.scheduleOnce(() => {
            let ani = this.node.getComponent(Animation)!;
            ani.play('PromptBoxEnd');
        }, this.duration);
    }

    public actOutFinished() {
        this.close();
    }

    private close() {
        this._curTime = null;
        find('bg', this.node)!.getComponent(Sprite)!.spriteFrame = this._baseBgFrame;
        find('bg', this.node)!.getComponent(UITransform)!.width = this._baseBgWidth;
        tween(this.node).stop();
        if (this._closeViewCallback) {
            this._closeViewCallback();
        }
    }

    public addViewCloseListener(cb: Function) {
        this._closeViewCallback = cb;
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
