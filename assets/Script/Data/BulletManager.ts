import { NotificationCenter } from './../Notification/NotificationCenter';
import { NotificationMessage } from './../Notification/NotificationMessage';
import { Bullet } from './../Prefab/Bullet';
import { BulletEd } from './BulletData';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Component, Node, NodePool, instantiate, Vec2, Vec3, Prefab } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
    @property(Prefab)
    enemyBullet: Prefab = null!;
    @property(Prefab)
    spaceShipBullet: Prefab = null!;

    private _enemyBulletPool: NodePool = new NodePool('Bullet');
    private _spaceShipBulletPool: NodePool = new NodePool('Bullet');

    createBullet(targetPosition: Vec3) {
        for (let i = 0; i < 8; i++) {
            let bullet = this.getBulletFromPool(this.enemyBullet, this._enemyBulletPool);
            bullet!.setPosition(targetPosition);
            let input = new Vec2(Math.sin(i / 8 * 2 * Math.PI), Math.cos(i / 8 * 2 * Math.PI));
            input = SpaceAttack.UnityVec2.clampMagnitude(input, 1);

            bullet!.getComponent(Bullet)!.move(new Vec3(input.x, input.y, 0), SpaceAttack.baseSpeed);
        }
    }

    fire(targetPosition: Vec3) {
        let bulletLeft = this.getBulletFromPool(this.spaceShipBullet, this._spaceShipBulletPool);
        let bulletRight = this.getBulletFromPool(this.spaceShipBullet, this._spaceShipBulletPool);

        let startPos = new Vec3();

        bulletLeft!.setPosition(Vec3.add(startPos, targetPosition, new Vec3(-0.5, 0, 0)));
        bulletRight!.setPosition(Vec3.add(startPos, targetPosition, new Vec3(0.5, 0, 0)));

        bulletLeft!.getComponent(Bullet)!.move(new Vec3(0, 1, 0), SpaceAttack.baseSpeed * 3);
        bulletRight!.getComponent(Bullet)!.move(new Vec3(0, 1, 0), SpaceAttack.baseSpeed * 3);
    }

    getBulletFromPool(prefab: Prefab, pool: NodePool, parent?: Node): Node | null {
        let bullet = null;
        if (pool.size() > 0) {
            bullet = pool.get(pool);
        } else {
            bullet = instantiate(prefab);
            bullet!.getComponent(Bullet)!.setPool(pool);
        }

        if (parent == null) {
            this.node.addChild(bullet!);
        } else {
            parent.addChild(bullet!);
        }

        return bullet;
    }

    onLoad() {
        BulletEd.addObserver(this);

        NotificationCenter.addObserver(this, this.fire.bind(this), NotificationMessage.FIRE);
    }

    onDestroy() {
        BulletEd.removeObserver(this);

        NotificationCenter.removeObserver(this, NotificationMessage.FIRE);
    }

    onEventMessage(event: NotificationMessage, data?: any) {
        switch (event) {
            case NotificationMessage.CREATE_BULLET:
                this.createBullet(data);
                break;
        }
    }
}
