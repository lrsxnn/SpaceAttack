import { NotificationCenter } from './../Notification/NotificationCenter';
import { NotificationMessage } from './../Notification/NotificationMessage';
import { BulletEd } from '../Data/BulletData';

import { _decorator, Component, Node, systemEvent, SystemEventType, EventKeyboard } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
    @property(Node)
    spaceShip: Node = null!;
    @property(Node)
    enemy: Node = null!;

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
            case 81://q
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {

    }

    start() {
        this.schedule(() => {
            BulletEd.notifyEvent(NotificationMessage.CREATE_BULLET, this.enemy.position.clone());
        }, 1);
    }
}
