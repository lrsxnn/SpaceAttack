import { NotificationCenter } from './../Notification/NotificationCenter';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Component, Node, systemEvent, SystemEventType, EventKeyboard, Vec2, Vec3, macro } from 'cc';
import { NotificationMessage } from '../Notification/NotificationMessage';
const { ccclass, property } = _decorator;

@ccclass('SpaceShip')
export class SpaceShip extends Component {
    @property
    speed = 0.05;

    private _axisHorizontal = 0;
    private _axisVertical = 0;
    private _wDown: boolean = false;
    private _sDown: boolean = false;
    private _aDown: boolean = false;
    private _dDown: boolean = false;
    private _spaceDown: boolean = false;

    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;

    private _fireTimeStep: number = 0.05;
    private _fireTime: number = this._fireTimeStep;
    onLoad() {
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
    }

    onDestroy() {
        systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEventType.KEY_UP, this.onKeyUp, this);
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.w://w
                this._wDown = true;
                break;
            case macro.KEY.s://s
                this._sDown = true;
                break;
            case macro.KEY.a://a
                this._aDown = true;
                break;
            case macro.KEY.d://d
                this._dDown = true;
                break;
            case macro.KEY.space:
                this._spaceDown = true;
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {
        switch (event.keyCode) {
            case macro.KEY.w://w
                this._wDown = false;
                break;
            case macro.KEY.s://s
                this._sDown = false;
                break;
            case macro.KEY.a://a
                this._aDown = false;
                break;
            case macro.KEY.d://d
                this._dDown = false;
                break;
            case macro.KEY.space:
                this._spaceDown = false;
                this._fireTime = this._fireTimeStep;
                break;
        }
    }

    update(dt: number) {
        this._lastTime += dt;
        let fixedTime = this._lastTime / this._fixedTimeStep;
        for (let i = 0; i < fixedTime; i++) {
            this.fixedUpdate();
        }
        this._lastTime = this._lastTime % this._fixedTimeStep;

        if (this._spaceDown) {
            this._fireTime += dt;
            if (this._fireTime > this._fireTimeStep) {
                this._fireTime -= this._fireTimeStep;
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE, this.node.position.clone());
            }
        }
    }

    fixedUpdate() {
        if (this._sDown) {
            this._axisVertical -= 0.05;
            if (this._axisVertical <= -1) {
                this._axisVertical = -1;
            }
        } else if (this._wDown) {
            this._axisVertical += 0.05;
            if (this._axisVertical >= 1) {
                this._axisVertical = 1;
            }
        } else {
            this._axisVertical = 0;
        }

        if (this._aDown) {
            this._axisHorizontal -= 0.05;
            if (this._axisHorizontal <= -1) {
                this._axisHorizontal = -1;
            }
        } else if (this._dDown) {
            this._axisHorizontal += 0.05;
            if (this._axisHorizontal >= 1) {
                this._axisHorizontal = 1;
            }
        } else {
            this._axisHorizontal = 0;
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
