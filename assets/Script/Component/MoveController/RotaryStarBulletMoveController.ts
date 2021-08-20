
import { _decorator, Vec3 } from 'cc';
import Decimal from '../../Plugin/decimal.js';
import { BulletMoveController } from './BulletMoveController';
const { ccclass } = _decorator;

@ccclass('RotaryStarBulletMoveController')
export class RotaryStarBulletMoveController extends BulletMoveController {
    private _startTime: Decimal = new Decimal(0);
    init() {
        super.init();
        this._startTime = new Decimal(0);
    }

    protected delayAction(): void {
    }

    //dt影响速度，this._bullet.data.speed影响距离
    protected moveAction(dt: Decimal): void {
        this._startTime = this._startTime.add(dt.div(2));
        let offset = this._bullet.data.angle.div(360);
        this._desiredVelocity.set(Decimal.sin(offset.mul(this._startTime.add(30))), Decimal.cos(offset.mul(this._startTime.add(30))), 1);
        this._desiredVelocity.multiplyScalar(Decimal.sin(this._startTime.sub(offset)).mul(Decimal.cos(offset)).mul(this._bullet.data.speed));

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
