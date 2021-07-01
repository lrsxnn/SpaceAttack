import { GameScene } from './../Scene/GameScene';
import { BulletFactory } from './BulletFactory';
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
    spacecraftBullet: Prefab = null!;

    private _gameScene: GameScene = null!;
    private _bulletFactory: BulletFactory = new BulletFactory();

    private _enemyBulletPool: NodePool = new NodePool('Bullet');
    private _spacecraftBulletPool: NodePool = new NodePool('Bullet');

    enemyFire(startPosition: Vec3) {
        for (let i = 0; i < 8; i++) {
            let input = new Vec2(Math.sin(i / 8 * 2 * Math.PI), Math.cos(i / 8 * 2 * Math.PI));
            input = SpaceAttack.UnityVec2.clampMagnitude(input, 1);

            this.createEnemyStraightLineBullet(startPosition, SpaceAttack.baseSpeed, new Vec3(input.x, input.y, 0), i / 8 * 360)
        }
    }

    spacecraftFire(startPosition: Vec3) {
        let _startPos = new Vec3();

        this.createSpacecraftStraightLineBullet(Vec3.add(_startPos, startPosition, new Vec3(-0.5, 0, 0)), SpaceAttack.baseSpeed * 3, new Vec3(0, 1, 0), 0);
        this.createSpacecraftStraightLineBullet(Vec3.add(_startPos, startPosition, new Vec3(0.5, 0, 0)), SpaceAttack.baseSpeed * 3, new Vec3(0, 1, 0), 0);


        let direction = new Vec2(Math.sin(1 / 8 * 2 * Math.PI), Math.cos(1 / 8 * 2 * Math.PI));
        direction = SpaceAttack.UnityVec2.clampMagnitude(direction, 1);

        this.createSpacecraftTrackingBullet(Vec3.add(_startPos, startPosition, new Vec3(0.5, 0, 0)), SpaceAttack.baseSpeed * 3, new Vec3(direction.x, direction.y, 0), 45);

        direction = new Vec2(Math.sin(7 / 8 * 2 * Math.PI), Math.cos(7 / 8 * 2 * Math.PI));
        this.createSpacecraftTrackingBullet(Vec3.add(_startPos, startPosition, new Vec3(-0.5, 0, 0)), SpaceAttack.baseSpeed * 3, new Vec3(direction.x, direction.y, 0), 315);

    }

    onLoad() {
        BulletEd.addObserver(this);
        this._gameScene = this.node.getComponent(GameScene)!;
        NotificationCenter.addObserver(this, this.spacecraftFire.bind(this), NotificationMessage.SPACECRAFT_FIRE);
    }

    onDestroy() {
        BulletEd.removeObserver(this);

        NotificationCenter.removeObserver(this, NotificationMessage.SPACECRAFT_FIRE);
    }

    onEventMessage(event: NotificationMessage, data?: any) {
        switch (event) {
            case NotificationMessage.ENEMY_FIRE:
                this.enemyFire(data);
                break;
        }
    }

    /**
     * 创建敌方直线子弹
     */
    private createEnemyStraightLineBullet(startPosition: Vec3, speed: number, inputDirection: Vec3, rotation: number) {
        let bullet = this._bulletFactory.getBulletFromPool(this.enemyBullet, this._enemyBulletPool, this.node);
        this._bulletFactory.createStraightLineBullet(bullet, startPosition, speed, inputDirection, rotation);
    }

    /**
     * 创建飞船直线子弹
     */
    private createSpacecraftStraightLineBullet(startPosition: Vec3, speed: number, inputDirection: Vec3, rotation: number) {
        let bullet = this._bulletFactory.getBulletFromPool(this.spacecraftBullet, this._spacecraftBulletPool, this.node);
        this._bulletFactory.createStraightLineBullet(bullet, startPosition, speed, inputDirection, rotation);
    }

    /**
     * 创建飞船追踪弹
     */
    private createSpacecraftTrackingBullet(startPosition: Vec3, speed: number, inputDirection: Vec3, rotation: number) {
        let enemyNode = this._gameScene.getNearestEnemy();
        let bullet = this._bulletFactory.getBulletFromPool(this.spacecraftBullet, this._spacecraftBulletPool, this.node);
        this._bulletFactory.createTrackingBullet(bullet, startPosition, speed, inputDirection, rotation, enemyNode);
    }
}
