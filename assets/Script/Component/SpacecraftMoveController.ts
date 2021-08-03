import { NotificationMessage } from './../Notification/NotificationMessage';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { Spacecraft } from './../Prefab/Spacecraft';
import { BaseComponent } from './BaseComponent';

import { _decorator, Vec2, Vec3 } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
const { ccclass } = _decorator;

@ccclass('SpacecraftMoveController')
export class SpacecraftMoveController extends BaseComponent {
    private _spacecraft: Spacecraft = null!;
    private _desiredVelocity: Vec3 = new Vec3();

    onLoad() {
        NotificationCenter.addObserver(this, this.moveAction, NotificationMessage.SPACECRAFT_MOVE);
    }

    onDestroy() {
        NotificationCenter.removeObserver(this, NotificationMessage.SPACECRAFT_MOVE);
    }

    onFixedUpdate() {
        this.node.setScale(this._spacecraft.data.scale);
        this.node.setRotation(this._spacecraft.data.rotation);
        this.node.setPosition(this._spacecraft.data.position);
    }

    public init() {
        this._spacecraft = this.node.getComponent(Spacecraft)!;

        this.node.setScale(this._spacecraft.data.scale);
        this.node.setPosition(this._spacecraft.data.position);
        this.node.setRotation(this._spacecraft.data.rotation);
    }

    private moveAction(data: { id: string, playerInput: Vec2 }) {
        if (data.id === this._spacecraft.data.id) {
            this._spacecraft.data.position = this.node.position.clone();

            this._desiredVelocity.set(data.playerInput.x, data.playerInput.y, 0);
            this._desiredVelocity.multiplyScalar(this._spacecraft.data.speed);

            this._spacecraft.data.position.add(this._desiredVelocity);

            if (this._spacecraft.data.position.x < SpaceAttack.ConstValue.allowedArea.xMin) {
                this._spacecraft.data.position.x = SpaceAttack.ConstValue.allowedArea.xMin;
            } else if (this._spacecraft.data.position.x > SpaceAttack.ConstValue.allowedArea.xMax) {
                this._spacecraft.data.position.x = SpaceAttack.ConstValue.allowedArea.xMax;
            }
            if (this._spacecraft.data.position.y < SpaceAttack.ConstValue.allowedArea.yMin) {
                this._spacecraft.data.position.y = SpaceAttack.ConstValue.allowedArea.yMin;
            } else if (this._spacecraft.data.position.y > SpaceAttack.ConstValue.allowedArea.yMax) {
                this._spacecraft.data.position.y = SpaceAttack.ConstValue.allowedArea.yMax;
            }
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
