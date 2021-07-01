import { _decorator, Component, Node, systemEvent, SystemEventType, EventKeyboard, error, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends Component {
    @property(Node)
    spacecraft: Node = null!;
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
        // this.schedule(() => {
        //     error(Vec3.angle(this.spacecraft.position, this.enemy.position) * 180 / Math.PI);
        // }, 1);
    }

    public getNearestEnemy(): Node {
        return this.enemy;
    }
}
