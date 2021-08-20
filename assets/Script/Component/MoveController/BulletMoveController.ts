import { DecimalVec3 } from './../../Plugin/DecimalVec3';
import { DecimalVec2 } from './../../Plugin/DecimalVec2';
import { BaseComponent } from './../BaseComponent';
import { Bullet } from './../../Prefab/Bullet';

import { _decorator, error } from 'cc';
import Decimal from '../../Plugin/decimal.js';
const { ccclass } = _decorator;

@ccclass('BulletMoveController')
export abstract class BulletMoveController extends BaseComponent {
    protected _bullet: Bullet = null!;
    protected _newDirection: DecimalVec2 = new DecimalVec2();
    protected _desiredVelocity: DecimalVec3 = new DecimalVec3();

    onFixedUpdate() {
        if (this._bullet.data.delayTime.greaterThan(0)) {
            this._bullet.data.delayTime = this._bullet.data.delayTime.sub(this._fixedTimeStep);
        } else {
            this.delayAction();
        }

        this._bullet.data.position.fromVec3(this.node.position);
        // if (this._bullet.node.name === "bullet1")
        //     error(`onFixedUpdate ${this._bullet.node.name} ${this.node.name} pos ${this._bullet.data.position.toVec3().toString()}`);

        this.moveAction(this._fixedTimeStep);
        // if (this._bullet.node.name === "bullet1")
        //     error(`onFixedUpdate move ${this._bullet.node.name} pos ${this._bullet.data.position.toVec3().toString()}`);
        this.node.setScale(this._bullet.data.scale.toVec3());
        this.node.setRotation(this._bullet.data.rotation.toQuat());
        this.node.setPosition(this._bullet.data.position.toVec3());
    }

    public init() {
        this._bullet = this.node.getComponent(Bullet)!;

        this.node.setScale(this._bullet.data.scale.toVec3());
        this.node.setPosition(this._bullet.data.position.toVec3());
        this.node.setRotation(this._bullet.data.rotation.toQuat());
    }

    /**
     * 延时动作
     */
    protected abstract delayAction(): void;

    /**
     * 移动
     */
    protected abstract moveAction(dt: Decimal): void;
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
