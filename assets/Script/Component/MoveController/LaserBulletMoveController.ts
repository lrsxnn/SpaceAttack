import { DecimalVec3 } from './../../Plugin/DecimalVec3';

import { _decorator, Vec3 } from 'cc';
import Decimal from '../../Plugin/decimal.js';
import { BulletMoveController } from './BulletMoveController';
const { ccclass } = _decorator;

@ccclass('LaserBulletMoveController')
export class LaserBulletMoveController extends BulletMoveController {
    /**
     * 延时动作
     */
    protected delayAction() {
    }

    /**
     * 移动
     */
    protected moveAction(dt: Decimal) {
        if (this._bullet.data.followNode != null && this._bullet.data.followPosition != null) {//跟随目标
            DecimalVec3.add(this._bullet.data.position, this._bullet.data.followNode.position, this._bullet.data.followPosition);
        }
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
