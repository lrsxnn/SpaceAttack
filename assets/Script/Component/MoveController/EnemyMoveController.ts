import { DecimalVec2 } from './../../Plugin/DecimalVec2';
import { DecimalVec3 } from './../../Plugin/DecimalVec3';
import { Enemy } from './../../Prefab/Enemy';
import { BaseComponent } from './../BaseComponent';

import { _decorator, Component, Node } from 'cc';
import Decimal from '../../Plugin/decimal.js';
import { SpaceAttack } from '../../Tools/Tools';
const { ccclass, property } = _decorator;

@ccclass('EnemyMoveController')
export class EnemyMoveController extends BaseComponent {
    private _enemy: Enemy = null!;

    private _axisHorizontal = new Decimal(0);
    private _axisVertical = new Decimal(0);

    private _playerInput: DecimalVec2 = new DecimalVec2();
    private _desiredVelocity: DecimalVec3 = new DecimalVec3();

    private _changePos = false;
    private _changePosTime: Decimal = new Decimal(0);

    onLoad() {
        this._enemy = this.node.getComponent(Enemy)!;
    }

    onFixedUpdate() {
        this.moveAction();

        this.node.setScale(this._enemy.data.scale.toVec3());
        this.node.setRotation(this._enemy.data.rotation.toQuat());
        this.node.setPosition(this._enemy.data.position.toVec3());
    }

    public init() {
        this._changePos = false;
        this._changePosTime = new Decimal(0);
        this._axisHorizontal = new Decimal(0);
        this._axisVertical = new Decimal(0);

        this.node.setScale(this._enemy.data.scale.toVec3());
        this.node.setPosition(this._enemy.data.position.toVec3());
        this.node.setRotation(this._enemy.data.rotation.toQuat());
    }

    private moveAction() {
        this._changePosTime = this._changePosTime.add(this._fixedTimeStep);
        if (this._changePosTime.greaterThan(2)) {
            this._changePosTime = this._changePosTime.sub(2);
            this._changePos = true;
        }

        if (this._changePos) {
            this._axisHorizontal = SpaceAttack.Utils.getSeedRandomIntInclusiveDecimal(-1, 1);
            this._axisVertical = SpaceAttack.Utils.getSeedRandomIntInclusiveDecimal(-1, 1);
            this._changePos = false;
        }

        this._playerInput.set(this._axisHorizontal, this._axisVertical);
        this._playerInput = SpaceAttack.UnityVec2.clampMagnitudeDecimal(this._playerInput, 1);

        this._desiredVelocity.set(this._playerInput.x, this._playerInput.y, 0);
        this._desiredVelocity.multiplyScalar(this._enemy.data.speed);

        this._enemy.data.position.set(this.node.position);
        this._enemy.data.position.add(this._desiredVelocity);

        if (this._enemy.data.position.x.lessThan(SpaceAttack.ConstValue.allowedArea.xMin)) {
            this._enemy.data.position.x = SpaceAttack.ConstValue.allowedArea.xMin;
        } else if (this._enemy.data.position.x.greaterThan(SpaceAttack.ConstValue.allowedArea.xMax)) {
            this._enemy.data.position.x = SpaceAttack.ConstValue.allowedArea.xMax;
        }
        if (this._enemy.data.position.y.lessThan(SpaceAttack.ConstValue.allowedArea.yMin)) {
            this._enemy.data.position.y = SpaceAttack.ConstValue.allowedArea.yMin;
        } else if (this._enemy.data.position.y.greaterThan(SpaceAttack.ConstValue.allowedArea.yMax)) {
            this._enemy.data.position.y = SpaceAttack.ConstValue.allowedArea.yMax;
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
