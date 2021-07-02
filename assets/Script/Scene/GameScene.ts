import { NotificationCenter } from './../Notification/NotificationCenter';
import { Enemy } from './../Prefab/Enemy';
import { Spacecraft } from './../Prefab/Spacecraft';
import { _decorator, Component, Node, systemEvent, SystemEventType, EventKeyboard, error, Vec3, Label, game, director } from 'cc';
import { NotificationMessage } from '../Notification/NotificationMessage';
const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
    @property(Node)
    spacecraft: Node = null!;
    @property(Node)
    enemy: Node = null!;
    @property(Label)
    label: Label = null!;

    onLoad() {
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);

    }

    onDestroy() {
        systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEventType.KEY_UP, this.onKeyUp, this);
    }

    start() {
        // this.schedule(() => {
        //     error(Vec3.angle(this.spacecraft.position, this.enemy.position) * 180 / Math.PI);
        // }, 1);
        director.pause();
    }

    update(dt: number) {
        this.label.string = `Spacecraft HP: ${this.spacecraft.getComponent(Spacecraft)!.hp}
Enemy HP: ${this.enemy.getComponent(Enemy)!.hp}`;
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case 81://q
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {

    }

    onClickPause() {
        director.pause();
        // game.pause();
    }

    onClickResume() {
        director.resume();
        // game.resume();
    }

    onClickStart() {
        director.resume();
        NotificationCenter.sendNotification(NotificationMessage.SET_PLAYER_CONTROLL, true);
    }

    public getNearestEnemy(): Node {
        return this.enemy;
    }
}
