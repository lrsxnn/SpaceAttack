import { Enemy } from './../../Prefab/Enemy';
import { DecimalVec2 } from './../../Plugin/DecimalVec2';
import { DecimalQuat } from './../../Plugin/DecimalQuat';
import { DecimalVec3 } from './../../Plugin/DecimalVec3';
import { BulletMoveController } from './BulletMoveController';

import { _decorator, Vec3, math, Vec2, Quat } from 'cc';
import { SpaceAttack } from '../../Tools/Tools';
import Decimal from '../../Plugin/decimal.js';
const { ccclass } = _decorator;

@ccclass('TrackingBulletMoveController')
export class TrackingBulletMoveController extends BulletMoveController {
    /**
     * 延时动作
     */
    protected delayAction() {
        if (this._bullet.data.targetNode !== null && this._bullet.data.targetNode.isValid) {//根据目标位置调整旋转角度以及前进方向
            let target = this._bullet.data.targetNode.getComponent(Enemy);
            if (target && !target.isAlive) {
                return;
            }
            this._newDirection.set(Decimal.sub(this._bullet.data.targetNode.position.x, this.node.position.x), Decimal.sub(this._bullet.data.targetNode.position.y, this.node.position.y));

            let angle = math.toDegree(this._newDirection.signAngle(DecimalVec2.UNIT_Y).toNumber());
            DecimalQuat.fromAngleZ(this._bullet.data.rotation, -angle);

            this._newDirection = SpaceAttack.UnityVec2.clampMagnitudeDecimal(this._newDirection, 1);
            this._bullet.data.changeVelocity(new DecimalVec3(this._newDirection.x, this._newDirection.y, 0));
        }
    }

    /**
     * 移动
     */
    protected moveAction(dt: Decimal) {
        DecimalVec3.multiplyScalar(this._desiredVelocity, this._bullet.data.inputDirection, this._bullet.data.speed);
        let maxSpeedChange = this._bullet.data.acceleration.mul(dt);
        this._bullet.data.velocity.x = SpaceAttack.UnityMathf.moveTowardsDecimal(this._bullet.data.velocity.x, this._desiredVelocity.x, maxSpeedChange);
        this._bullet.data.velocity.y = SpaceAttack.UnityMathf.moveTowardsDecimal(this._bullet.data.velocity.y, this._desiredVelocity.y, maxSpeedChange);

        DecimalVec3.multiplyScalar(this._desiredVelocity, this._bullet.data.velocity, dt);
        this._bullet.data.position.add(this._desiredVelocity);
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
