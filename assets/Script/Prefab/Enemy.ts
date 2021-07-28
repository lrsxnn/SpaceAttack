import { Bullet } from './Bullet';
import { NotificationMessage } from './../Notification/NotificationMessage';

import { _decorator, Component, Node, Vec2, Vec3, error, BoxCollider, ITriggerEvent } from 'cc';
import { BulletEd } from '../Data/BulletData';
import { SpaceAttack } from '../Tools/Tools';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property
    speed = 0.02;
    @property
    damage = 1;
    @property
    hp = 100;

    private _axisHorizontal = 0;
    private _axisVertical = 0;

    private _playerInput: Vec2 = new Vec2();
    private _desiredVelocity: Vec3 = new Vec3();
    private _lastPos: Vec3 = new Vec3();

    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;

    private _changePos = true;
    private _changePosTime = 0;

    onLoad() {
        this.node.getComponent(BoxCollider)!.on('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(BoxCollider)!.on('onTriggerStay', this.onTriggerStay, this);
    }

    onDestroy() {
        this.node.getComponent(BoxCollider)!.off('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(BoxCollider)!.off('onTriggerStay', this.onTriggerStay, this);
    }

    start() {
        this.schedule(() => {
            BulletEd.notifyEvent(NotificationMessage.ENEMY_FIRE, this.node.position.clone());
        }, 1);
    }

    update(dt: number) {
        this._lastTime += dt;
        let fixedTime = this._lastTime / this._fixedTimeStep;
        for (let i = 0; i < fixedTime; i++) {
            this.fixedUpdate();
        }
        this._lastTime = this._lastTime % this._fixedTimeStep;
    }

    fixedUpdate() {
        // if (this._sDown) {
        //     this._axisVertical -= 0.05;
        //     if (this._axisVertical <= -1) {
        //         this._axisVertical = -1;
        //     }
        // } else if (this._wDown) {
        //     this._axisVertical += 0.05;
        //     if (this._axisVertical >= 1) {
        //         this._axisVertical = 1;
        //     }
        // } else {
        //     this._axisVertical = 0;
        // }

        // if (this._aDown) {
        //     this._axisHorizontal -= 0.05;
        //     if (this._axisHorizontal <= -1) {
        //         this._axisHorizontal = -1;
        //     }
        // } else if (this._dDown) {
        //     this._axisHorizontal += 0.05;
        //     if (this._axisHorizontal >= 1) {
        //         this._axisHorizontal = 1;
        //     }
        // } else {
        //     this._axisHorizontal = 0;
        // }

        this._changePosTime += this._fixedTimeStep;
        if (this._changePosTime > 2) {
            this._changePosTime -= 2;
            this._changePos = true;
        }

        if (this._changePos) {
            this._axisHorizontal = SpaceAttack.Utils.getRandomIntInclusive(-1, 1);
            this._axisVertical = SpaceAttack.Utils.getRandomIntInclusive(-1, 1);
            this._changePos = false;
        }

        this._playerInput.set(this._axisHorizontal, this._axisVertical);
        this._playerInput = SpaceAttack.UnityVec2.clampMagnitude(this._playerInput, 1);

        this._desiredVelocity.set(this._playerInput.x, this._playerInput.y, 0);
        this._desiredVelocity.multiplyScalar(this.speed);

        this._lastPos = this.node.position.clone();
        this._lastPos.add(this._desiredVelocity);

        if (this._lastPos.x < SpaceAttack.allowedArea.xMin) {
            this._lastPos.x = SpaceAttack.allowedArea.xMin;
        } else if (this._lastPos.x > SpaceAttack.allowedArea.xMax) {
            this._lastPos.x = SpaceAttack.allowedArea.xMax;
        }
        if (this._lastPos.y < SpaceAttack.allowedArea.yMin) {
            this._lastPos.y = SpaceAttack.allowedArea.yMin;
        } else if (this._lastPos.y > SpaceAttack.allowedArea.yMax) {
            this._lastPos.y = SpaceAttack.allowedArea.yMax;
        }
        this.node.setPosition(this._lastPos);
    }

    onTriggerStay(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let bullet = node.getComponent(Bullet)
        if (bullet) {
            this.hp -= bullet.damage;
        }
    }

    public init() {

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
