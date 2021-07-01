import { GameScene } from './../Scene/GameScene';
import { BulletFactory } from './BulletFactory';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { NotificationMessage } from './../Notification/NotificationMessage';
import { Bullet } from './../Prefab/Bullet';
import { BulletEd, BulletData } from './BulletData';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Component, Node, NodePool, instantiate, Vec2, Vec3, Prefab, SphereCollider, Mesh, MeshRenderer } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BulletManager')
export class BulletManager extends Component {
    @property(Prefab)
    enemyBullet: Prefab = null!;
    @property(Prefab)
    spacecraftBullet: Prefab = null!;
    @property(Mesh)
    enemySphere: Mesh = null!;
    @property(Mesh)
    enemyCone: Mesh = null!;
    @property(Mesh)
    enemyCylinder: Mesh = null!;
    @property(Mesh)
    spacecraftSphere: Mesh = null!;
    @property(Mesh)
    spacecraftCone: Mesh = null!;
    @property(Mesh)
    spacecraftCylinder: Mesh = null!;

    private _gameScene: GameScene = null!;
    private _bulletFactory: BulletFactory = new BulletFactory();

    private _enemyBulletPool: NodePool = new NodePool('Bullet');
    private _spacecraftBulletPool: NodePool = new NodePool('Bullet');

    enemyFire(startPosition: Vec3) {
        for (let i = 0; i < 8; i++) {
            let input = new Vec2(Math.sin(i / 8 * 2 * Math.PI), Math.cos(i / 8 * 2 * Math.PI));
            input = SpaceAttack.UnityVec2.clampMagnitude(input, 1);

            let data = this._bulletFactory.createStraightLineBulletData(startPosition, SpaceAttack.baseSpeed, new Vec3(input.x, input.y, 0), i / 8 * 360, 0.5);
            this._bulletFactory.createSphereBullet(this.enemyBullet, this._enemyBulletPool, this.node, this.enemySphere, data);
        }
    }

    spacecraftFireStraighLine(startPosition: Vec3) {
        let _startPos = new Vec3();
        //直线圆弹
        Vec3.add(_startPos, startPosition, new Vec3(-0.5, 0, 0))
        let data = this._bulletFactory.createStraightLineBulletData(_startPos, SpaceAttack.baseSpeed * 3, Vec3.UP, 0, 0.5);
        this._bulletFactory.createSphereBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftSphere, data);
        Vec3.add(_startPos, startPosition, new Vec3(0.5, 0, 0))
        data = this._bulletFactory.createStraightLineBulletData(_startPos, SpaceAttack.baseSpeed * 3, Vec3.UP, 0, 0.5);
        this._bulletFactory.createSphereBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftSphere, data);
    }

    spacecraftFireTracking(startPosition: Vec3) {
        let _startPos = new Vec3();
        //追踪弹
        let target = this._gameScene.getNearestEnemy();

        let direction = new Vec2(Math.sin(1 / 8 * 2 * Math.PI), Math.cos(1 / 8 * 2 * Math.PI));
        direction = SpaceAttack.UnityVec2.clampMagnitude(direction, 1);
        Vec3.add(_startPos, startPosition, new Vec3(0.5, 0, 0))
        let data = this._bulletFactory.createTrackingBulletData(_startPos, SpaceAttack.baseSpeed * 3, new Vec3(direction.x, direction.y, 0), 45, 0.5, 1, target, 0.1)
        this._bulletFactory.createConeBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCone, data);

        direction = new Vec2(Math.sin(7 / 8 * 2 * Math.PI), Math.cos(7 / 8 * 2 * Math.PI));
        direction = SpaceAttack.UnityVec2.clampMagnitude(direction, 1);
        Vec3.add(_startPos, startPosition, new Vec3(-0.5, 0, 0))
        data = this._bulletFactory.createTrackingBulletData(_startPos, SpaceAttack.baseSpeed * 3, new Vec3(direction.x, direction.y, 0), 315, 0.5, 1, target, 0.1)
        this._bulletFactory.createConeBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCone, data);
    }

    spacecraftFireLaser(startPosition: Vec3) {
        let _startPos = new Vec3();

        //激光
        Vec3.add(_startPos, startPosition, new Vec3(2, 10, 0));
        let data = this._bulletFactory.createLaserBulletData(_startPos, Vec3.UP, 0, 0.25, 10, null, 0.1, 1);
        this._bulletFactory.createCylinderBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCylinder, data);

        Vec3.add(_startPos, startPosition, new Vec3(-2, 10, 0));
        data = this._bulletFactory.createLaserBulletData(_startPos, Vec3.UP, 0, 0.25, 10, null, 0.1, 1);
        this._bulletFactory.createCylinderBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCylinder, data);
    }

    onLoad() {
        BulletEd.addObserver(this);
        this._gameScene = this.node.getComponent(GameScene)!;
        NotificationCenter.addObserver(this, this.spacecraftFireStraighLine.bind(this), NotificationMessage.SPACECRAFT_FIRE_STRAIGHTLINE);
        NotificationCenter.addObserver(this, this.spacecraftFireTracking.bind(this), NotificationMessage.SPACECRAFT_FIRE_TRACKING);
        NotificationCenter.addObserver(this, this.spacecraftFireLaser.bind(this), NotificationMessage.SPACECRAFT_FIRE_LASER);
    }

    onDestroy() {
        BulletEd.removeObserver(this);

        NotificationCenter.removeObserver(this, NotificationMessage.SPACECRAFT_FIRE_STRAIGHTLINE);
        NotificationCenter.removeObserver(this, NotificationMessage.SPACECRAFT_FIRE_TRACKING);
        NotificationCenter.removeObserver(this, NotificationMessage.SPACECRAFT_FIRE_LASER);
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
    private createEnemyStraightLineBullet(data: BulletData) {
        this._bulletFactory.createSphereBullet(this.enemyBullet, this._enemyBulletPool, this.node, this.enemySphere, data);
    }

    /**
     * 创建飞船直线子弹
     */
    private createSpacecraftStraightLineBullet(data: BulletData) {
        this._bulletFactory.createSphereBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftSphere, data);
    }

    /**
     * 创建飞船追踪弹
     */
    private createSpacecraftTrackingBullet(data: BulletData) {
        this._bulletFactory.createConeBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCone, data);
    }

    /**
     * 创建飞船激光
     */
    private createSpcaecraftLaser(data: BulletData) {
        this._bulletFactory.createCylinderBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCylinder, data);

    }
}
