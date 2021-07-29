import { GameScene } from './../Scene/GameScene';
import { BulletFactory } from './BulletFactory';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { NotificationMessage } from './../Notification/NotificationMessage';
import { Bullet } from './../Prefab/Bullet';
import { BulletEd, BulletData, BulletBaseDataParam, BULLET_MOVE_TYPE, BULLET_COLLIDER_TYPE } from './BulletData';
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
        // for (let i = 0; i < 8; i++) {
        //     let input = new Vec2(Math.sin(i / 8 * 2 * Math.PI), Math.cos(i / 8 * 2 * Math.PI));
        //     input = SpaceAttack.UnityVec2.clampMagnitude(input, 1);

        //     let param: BulletBaseDataParam = {
        //         moveType: BULLET_MOVE_TYPE.STRAIGHTLINE,
        //         colliderType: BULLET_COLLIDER_TYPE.SPHERE,
        //         position: startPosition,
        //         angle: i / 8 * 360,
        //         inputDirection: new Vec3(input.x, input.y, 0),
        //         speed: SpaceAttack.baseSpeed,
        //     };
        //     let data = new BulletData(param);
        //     this._bulletFactory.createBullet(this.enemyBullet, this._enemyBulletPool, this.node, this.enemySphere, data);
        // }

        for (let i = 0; i < 200; i++) {
            let param: BulletBaseDataParam = {
                moveType: BULLET_MOVE_TYPE.ROTARYSTAR,
                colliderType: BULLET_COLLIDER_TYPE.SPHERE,
                position: startPosition,
                angle: i / 200 * 360,
                inputDirection: Vec3.ZERO,
                speed: SpaceAttack.baseSpeed,
            };
            let data = new BulletData(param);
            data.setRotaryStarData();
            this._bulletFactory.createBullet(this.enemyBullet, this._enemyBulletPool, this.node, this.enemySphere, data);
        }
    }

    spacecraftFireStraighLine(startPosition: Vec3) {
        let _startPos = new Vec3();
        //直线圆弹
        Vec3.add(_startPos, startPosition, new Vec3(-0.5, 0, 0))
        let param: BulletBaseDataParam = {
            moveType: BULLET_MOVE_TYPE.STRAIGHTLINE,
            colliderType: BULLET_COLLIDER_TYPE.SPHERE,
            position: _startPos,
            angle: 0,
            inputDirection: Vec3.UP,
            speed: SpaceAttack.baseSpeed * 3,
        };
        let data = new BulletData(param);
        this._bulletFactory.createBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftSphere, data);

        Vec3.add(_startPos, startPosition, new Vec3(0.5, 0, 0))
        param = {
            moveType: BULLET_MOVE_TYPE.STRAIGHTLINE,
            colliderType: BULLET_COLLIDER_TYPE.SPHERE,
            position: _startPos,
            angle: 0,
            inputDirection: Vec3.UP,
            speed: SpaceAttack.baseSpeed * 3,
        };
        data = new BulletData(param);
        this._bulletFactory.createBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftSphere, data);
    }

    spacecraftFireTracking(startPosition: Vec3) {
        let _startPos = new Vec3();
        //追踪弹
        let target = this._gameScene.getNearestEnemy();

        let direction = new Vec2(Math.sin(1 / 8 * 2 * Math.PI), Math.cos(1 / 8 * 2 * Math.PI));
        direction = SpaceAttack.UnityVec2.clampMagnitude(direction, 1);
        Vec3.add(_startPos, startPosition, new Vec3(0.5, 0, 0))
        let param: BulletBaseDataParam = {
            moveType: BULLET_MOVE_TYPE.TRACKING,
            colliderType: BULLET_COLLIDER_TYPE.CONE,
            position: _startPos,
            angle: 45,
            inputDirection: new Vec3(direction.x, direction.y, 0),
            speed: SpaceAttack.baseSpeed * 3,
        };
        let data = new BulletData(param);
        data.setTrackingData(0.1, target);
        this._bulletFactory.createBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCone, data);

        direction = new Vec2(Math.sin(7 / 8 * 2 * Math.PI), Math.cos(7 / 8 * 2 * Math.PI));
        direction = SpaceAttack.UnityVec2.clampMagnitude(direction, 1);
        Vec3.add(_startPos, startPosition, new Vec3(-0.5, 0, 0))
        param = {
            moveType: BULLET_MOVE_TYPE.TRACKING,
            colliderType: BULLET_COLLIDER_TYPE.CONE,
            position: _startPos,
            angle: 315,
            inputDirection: new Vec3(direction.x, direction.y, 0),
            speed: SpaceAttack.baseSpeed * 3,
        };
        data = new BulletData(param);
        data.setTrackingData(0.1, target);
        this._bulletFactory.createBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCone, data);
    }

    spacecraftFireLaser(followNode: Node) {
        let height = SpaceAttack.allowedArea.yMax - SpaceAttack.allowedArea.yMin;
        //激光
        let param: BulletBaseDataParam = {
            moveType: BULLET_MOVE_TYPE.TRACKING,
            colliderType: BULLET_COLLIDER_TYPE.CONE,
            position: Vec3.ZERO,
            angle: 0,
            inputDirection: Vec3.UP,
            radius: 0.25,
            height: height,
        };
        let data = new BulletData(param);
        data.setLaserData(0.1, followNode, new Vec3(-2, height, 0), 1);
        this._bulletFactory.createBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCylinder, data);

        param = {
            moveType: BULLET_MOVE_TYPE.TRACKING,
            colliderType: BULLET_COLLIDER_TYPE.CONE,
            position: Vec3.ZERO,
            angle: 0,
            inputDirection: Vec3.UP,
            radius: 0.25,
            height: height,
            lifeTime: 1,
        };
        data = new BulletData(param);
        data.setLaserData(0.1, followNode, new Vec3(2, height, 0));
        this._bulletFactory.createBullet(this.spacecraftBullet, this._spacecraftBulletPool, this.node, this.spacecraftCylinder, data);
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
}
