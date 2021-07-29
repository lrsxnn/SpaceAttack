import { BaseComponent } from './../Component/BaseComponent';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, systemEvent, SystemEventType, EventKeyboard, Vec2, Vec3, macro, ConeCollider, ITriggerEvent } from 'cc';
import { NotificationMessage } from '../Notification/NotificationMessage';
const { ccclass, property } = _decorator;

@ccclass('Spacecraft')
export class Spacecraft extends BaseComponent {
    @property
    speed = 0.05;
    @property
    hp = 100;

    private _keyboardDirection: Vec2 = new Vec2();
    private _joystickDirection: Vec2 = new Vec2();
    private _wDown: boolean = false;
    private _sDown: boolean = false;
    private _aDown: boolean = false;
    private _dDown: boolean = false;
    private _spaceDown: boolean = false;

    private _playerInput: Vec2 = new Vec2();
    private _desiredVelocity: Vec3 = new Vec3();
    private _lastPos: Vec3 = new Vec3();

    private _fireStraightLineTimeStep: number = 0.05;
    private _fireStraightLineTime: number = this._fireStraightLineTimeStep;
    private _fireTrackingTimeStep: number = 0.1;
    private _fireTrackingTime: number = this._fireTrackingTimeStep;
    private _fireLaserTimeStep: number = 2;
    private _fireLaserTime: number = this._fireLaserTimeStep;
    onLoad() {
        NotificationCenter.addObserver(this, this.onSetPlayerControll, NotificationMessage.SET_PLAYER_CONTROLL);
        NotificationCenter.addObserver(this, this.onJoysticMove, NotificationMessage.JOYSTICK_MOVE);
    }

    onDestroy() {
        NotificationCenter.removeObserver(this, NotificationMessage.SET_PLAYER_CONTROLL);
        NotificationCenter.removeObserver(this, NotificationMessage.JOYSTICK_MOVE);
    }

    onFixedUpdate() {
        if (this._spaceDown) {
            this._fireStraightLineTime += this._fixedTimeStep;
            this._fireTrackingTime += this._fixedTimeStep;
            this._fireLaserTime += this._fixedTimeStep;
            if (this._fireStraightLineTime > this._fireStraightLineTimeStep) {
                this._fireStraightLineTime -= this._fireStraightLineTimeStep;
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_STRAIGHTLINE, this.node.position.clone());
            }
            if (this._fireTrackingTime > this._fireTrackingTimeStep) {
                this._fireTrackingTime -= this._fireTrackingTimeStep;
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_TRACKING, this.node.position.clone());
            }
            if (this._fireLaserTime > this._fireLaserTimeStep) {
                this._fireLaserTime -= this._fireLaserTimeStep;
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_LASER, this.node);
            }
        }

        if (this._sDown) {
            this._keyboardDirection.y -= 0.05;
            if (this._keyboardDirection.y <= -1) {
                this._keyboardDirection.y = -1;
            }
        } else if (this._wDown) {
            this._keyboardDirection.y += 0.05;
            if (this._keyboardDirection.y >= 1) {
                this._keyboardDirection.y = 1;
            }
        } else {
            this._keyboardDirection.y = 0;
        }

        if (this._aDown) {
            this._keyboardDirection.x -= 0.05;
            if (this._keyboardDirection.x <= -1) {
                this._keyboardDirection.x = -1;
            }
        } else if (this._dDown) {
            this._keyboardDirection.x += 0.05;
            if (this._keyboardDirection.x >= 1) {
                this._keyboardDirection.x = 1;
            }
        } else {
            this._keyboardDirection.x = 0;
        }

        if (this._joystickDirection.equals(Vec2.ZERO)) {
            this._playerInput.set(this._keyboardDirection);
        } else {
            this._playerInput.set(this._joystickDirection);
        }
        this._playerInput = SpaceAttack.UnityVec2.clampMagnitude(this._playerInput, 1);

        this._desiredVelocity.set(this._playerInput.x, this._playerInput.y, 0);
        this._desiredVelocity.multiplyScalar(this.speed);

        this._lastPos = this.node.position.clone();
        this._lastPos.add(this._desiredVelocity);

        if (this._lastPos.x < SpaceAttack.ConstValue.allowedArea.xMin) {
            this._lastPos.x = SpaceAttack.ConstValue.allowedArea.xMin;
        } else if (this._lastPos.x > SpaceAttack.ConstValue.allowedArea.xMax) {
            this._lastPos.x = SpaceAttack.ConstValue.allowedArea.xMax;
        }
        if (this._lastPos.y < SpaceAttack.ConstValue.allowedArea.yMin) {
            this._lastPos.y = SpaceAttack.ConstValue.allowedArea.yMin;
        } else if (this._lastPos.y > SpaceAttack.ConstValue.allowedArea.yMax) {
            this._lastPos.y = SpaceAttack.ConstValue.allowedArea.yMax;
        }
        this.node.setPosition(this._lastPos);
    }

    onPauseEnter() {
        this.node.getComponent(ConeCollider)!.off('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(ConeCollider)!.off('onTriggerStay', this.onTriggerStay, this);
    }

    onPauseExit() {
        this.node.getComponent(ConeCollider)!.on('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(ConeCollider)!.on('onTriggerStay', this.onTriggerStay, this);
    }

    onJoysticMove(direction: Vec3) {
        this._joystickDirection.x = direction.x;
        this._joystickDirection.y = direction.y;
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
                // this._fireStraightLineTime = this._fireStraightLineTimeStep;
                // this._fireTrackingTime = this._fireTrackingTimeStep;
                // this._fireLaserTime = this._fireLaserTimeStep;
                break;
        }
    }

    onSetPlayerControll(canControll: boolean) {
        if (canControll) {
            systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
            systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);
        } else {
            systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
            systemEvent.off(SystemEventType.KEY_UP, this.onKeyUp, this);
        }
    }

    onTriggerStay(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let bullet = node.getComponent(Bullet)
        if (bullet) {
            this.hp -= bullet.damage;
        }
        let enemy = node.getComponent(Enemy)
        if (enemy) {
            this.hp -= enemy.damage;
        }
    }

    public init() {

    }
}
