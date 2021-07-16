import { NotificationCenter } from './../Notification/NotificationCenter';

import { _decorator, Component, Node, EventTouch, Vec2, Vec3, UITransform, math } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
import { NotificationMessage } from '../Notification/NotificationMessage';
const { ccclass, property } = _decorator;

@ccclass('Joystick')
export class Joystick extends Component {
    @property(Node)
    midNode: Node = null!;
    @property(Node)
    joyBackground: Node = null!;
    @property
    maxRadius = 100;
    @property(UITransform)
    uiTransform: UITransform = null!;

    private _pos: Vec3 = new Vec3();
    private _pos2: Vec2 = new Vec2();

    onLoad() {
        this.midNode.setPosition(Vec3.ZERO);
    }

    start() {
        this.joyBackground.on(Node.EventType.TOUCH_START, this.onTouched, this);
        this.joyBackground.on(Node.EventType.TOUCH_MOVE, this.onTouched, this);
        this.joyBackground.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.joyBackground.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouched(event: EventTouch) {
        const location = event.getUILocation();
        this._pos.set(location.x, location.y, 0);
        this._pos = this.uiTransform.convertToNodeSpaceAR(this._pos);
        this._pos2.set(this._pos.x, this._pos.y);
        this._pos2 = SpaceAttack.UnityVec2.clampMagnitude(this._pos2, this.maxRadius);
        this._pos.set(this._pos2.x, this._pos2.y, 0);
        this.midNode.setPosition(this._pos);
        // let angle = math.toDegree(Math.atan2(pos.y, pos.x));

        NotificationCenter.sendNotification(NotificationMessage.JOYSTICK_MOVE, this._pos);
    }

    onTouchEnd(event: EventTouch) {
        this.midNode.setPosition(Vec3.ZERO);
        NotificationCenter.sendNotification(NotificationMessage.JOYSTICK_MOVE, Vec3.ZERO);
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
