
import { _decorator, Component } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
const { ccclass } = _decorator;

@ccclass('BaseComponent')
export class BaseComponent extends Component {
    protected _fixedTimeStep: number = 0.02;
    protected _lastTime: number = 0;

    private _isPaused: boolean = false;

    protected onEnable() {
        this._isPaused = SpaceAttack.ConstValue.pause;
    }

    protected update(dt: number) {
        if (!SpaceAttack.ConstValue.pause) {
            if (this._isPaused) {
                this._isPaused = false;
                this.onPauseExit();
            }

            this._lastTime += dt;
            let fixedTime = this._lastTime / this._fixedTimeStep;
            for (let i = 0; i < fixedTime; i++) {
                this.onFixedUpdate();
            }
            this._lastTime = this._lastTime % this._fixedTimeStep;

            this.onUpdate(dt);
        } else {
            if (!this._isPaused) {
                this._isPaused = true;
                this.onPauseEnter();
            }
        }
    }

    protected lateUpdate() {
        if (!SpaceAttack.ConstValue.pause) {
            this.onLateUpdate();
        }
    }

    protected onUpdate(dt: number) {

    }

    protected onLateUpdate() {

    }

    protected onFixedUpdate() {

    }

    /**
     * 暂停结束回调
     */
    protected onPauseExit() {

    }

    /**
     * 暂停开始回调
     */
    protected onPauseEnter() {

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
