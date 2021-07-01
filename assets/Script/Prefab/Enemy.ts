import { NotificationMessage } from './../Notification/NotificationMessage';

import { _decorator, Component, Node, Vec2, Vec3, error } from 'cc';
import { BulletEd } from '../Data/BulletData';
import { SpaceAttack } from '../Tools/Tools';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends Component {
    @property
    speed = 0.02;

    private _axisHorizontal = 0;
    private _axisVertical = 0;

    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;

    private _changePos = true;
    private _changePosTime = 0;

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

        this._changePosTime += dt;
        if (this._changePosTime > 2) {
            this._changePosTime -= 2;
            this._changePos = true;
        }
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

        if (this._changePos) {
            this._axisHorizontal = SpaceAttack.Utils.getRandomIntInclusive(-1, 1);
            this._axisVertical = SpaceAttack.Utils.getRandomIntInclusive(-1, 1);
            this._changePos = false;
        }

        let playerInput = new Vec2(this._axisHorizontal, this._axisVertical);
        playerInput = SpaceAttack.UnityVec2.clampMagnitude(playerInput, 1);

        let desiredVelocity = new Vec3();
        Vec3.multiplyScalar(desiredVelocity, new Vec3(playerInput.x, playerInput.y, 0), this.speed);

        let lastPos = this.node.position.clone();
        lastPos.add(desiredVelocity);

        if (lastPos.x < SpaceAttack.allowedArea.xMin) {
            lastPos.x = SpaceAttack.allowedArea.xMin;
        } else if (lastPos.x > SpaceAttack.allowedArea.xMax) {
            lastPos.x = SpaceAttack.allowedArea.xMax;
        }
        if (lastPos.y < SpaceAttack.allowedArea.yMin) {
            lastPos.y = SpaceAttack.allowedArea.yMin;
        } else if (lastPos.y > SpaceAttack.allowedArea.yMax) {
            lastPos.y = SpaceAttack.allowedArea.yMax;
        }
        this.node.setPosition(lastPos);
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
