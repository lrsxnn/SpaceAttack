/**
 * 避免cc.Button重复点击 导致发送多次消息
 */
import { _decorator, Component, Node, CCFloat, Button, EventHandler } from 'cc';
import PromptBoxUtil from './PromptBoxUtil';
const { ccclass, property } = _decorator;
const MAX_REPEAT = 2;//单位时间内点击达到n+1次 提示
@ccclass('Forbid')
export class Forbid extends Component {
    @property({ type: CCFloat, tooltip: '两次点击间隔时间' })
    time: number = 0.5;

    private _button: Button = null!;
    private _clickEvents: EventHandler[] = [];

    private _tempTime = 0;
    private _clickTime: number | null = null;
    private _lastTime = 0;
    private _repeatCount = 0;
    private _cd = false;

    onEnable() {
        if (this._cd) {
            this.cleanCD();
        }
    }

    onDisable() {
        if (this._cd) {
            this.cleanCD();
        }
    }

    start() {
        let button = this.node.getComponent(Button);
        if (!button) {
            return;
        }

        this._button = button;
        this._clickEvents = button.clickEvents;
        this.node.on('click', this.onClick, this);

        this._tempTime = 0;
        this._clickTime = null;
        this._lastTime = 0;
        this._repeatCount = 0;
    }

    update(dt: number) {
        if (this._cd) {
            if (this._lastTime > 0) {
                if (this._tempTime >= 1) {
                    this._tempTime = 0;

                    if (this._clickTime !== null) {
                        let tempTime = new Date().getTime() - this._clickTime;
                        this._lastTime = Math.ceil((this.time * 1000 - tempTime) / 1000);

                        if (this._lastTime <= 0) {
                            this.cleanCD();
                        }
                    } else {
                        this.cleanCD();
                    }
                } else {
                    this._tempTime += dt;
                }
            } else {
                this.cleanCD();
            }
        }
    }

    onClick() {
        if (!this._cd) {
            this._lastTime = this.time;
            this._clickTime = new Date().getTime();
            this._cd = true;
            this._tempTime = 0;
            this._button.clickEvents = [];
            this._repeatCount = 0;
        } else {
            if (this._clickTime !== null) {
                let tempTime = new Date().getTime() - this._clickTime;
                this._lastTime = Math.ceil((this.time * 1000 - tempTime) / 1000);

                if (this._lastTime <= 0) {
                    this._lastTime = 0;
                }
            }
        }

        this._repeatCount++;
        if (this._repeatCount >= MAX_REPEAT) {
            PromptBoxUtil.show(`点击过于频繁，请等待${Math.ceil(this._lastTime)}秒钟后重试`);
        }

        if (this._lastTime <= 0) {
            this.cleanCD();
        }
    }

    private cleanCD() {
        this._cd = false;
        this._button.clickEvents = this._clickEvents;
        this._clickTime = null;
        this._lastTime = this.time;
        this._repeatCount = 0;
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
