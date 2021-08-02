
import { _decorator, Vec3 } from 'cc';
import { BulletMoveController } from './BulletMoveController';
const { ccclass } = _decorator;

@ccclass('RotaryStarBulletMoveController')
export class RotaryStarBulletMoveController extends BulletMoveController {
    private _startTime = 0;
    init() {
        super.init();
        this._startTime = 0;
    }

    protected delayAction(): void {
    }

    //dt影响速度，this._bullet.data.speed影响距离
    protected moveAction(dt: number): void {
        this._startTime += dt / 2;
        let offset = this._bullet.data.angle / 360;
        this._desiredVelocity.set(Math.sin(offset * (this._startTime + 30)), Math.cos(offset * (this._startTime + 30)), 1);
        this._desiredVelocity.multiplyScalar(Math.sin(this._startTime - offset) * Math.cos(offset) * this._bullet.data.speed);

        this._bullet.data.position.set(this._desiredVelocity);
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
