import { NotificationMessage } from './../Notification/NotificationMessage';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { BaseComponent } from './BaseComponent';

import { _decorator, Vec3, systemEvent, SystemEventType, EventKeyboard, macro } from 'cc';
const { ccclass } = _decorator;

@ccclass('KeyboardController')
export class KeyboardController extends BaseComponent {
    private _wDown: boolean = false;
    private _sDown: boolean = false;
    private _aDown: boolean = false;
    private _dDown: boolean = false;
    private _spaceDown: boolean = false;

    private _pos: Vec3 = new Vec3();
    onFixedUpdate() {
        if (this._sDown) {
            this._pos.y -= 0.05;
            if (this._pos.y <= -1) {
                this._pos.y = -1;
            }
        } else if (this._wDown) {
            this._pos.y += 0.05;
            if (this._pos.y >= 1) {
                this._pos.y = 1;
            }
        } else {
            this._pos.y = 0;
        }

        if (this._aDown) {
            this._pos.x -= 0.05;
            if (this._pos.x <= -1) {
                this._pos.x = -1;
            }
        } else if (this._dDown) {
            this._pos.x += 0.05;
            if (this._pos.x >= 1) {
                this._pos.x = 1;
            }
        } else {
            this._pos.x = 0;
        }

        NotificationCenter.sendNotification(NotificationMessage.KEYBOARD_MOVE, { spaceDown: this._spaceDown, playerInput: this._pos });
    }

    onPauseEnter() {
        systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEventType.KEY_UP, this.onKeyUp, this);
    }

    onPauseExit() {
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
                break;
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
