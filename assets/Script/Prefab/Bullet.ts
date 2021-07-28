import { BulletMoveController } from './BulletMoveController/BulletMoveController';
import { BulletData } from './../Data/BulletData';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Component, Vec3, NodePool, Quat, Vec2, Collider, error, math } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;

    private _data: BulletData = null!;
    public get data(): BulletData {
        return this._data;
    }

    private _bulletPool: NodePool = null!;

    private _damage: number = 1;
    public get damage(): number {
        return this._damage;
    }

    private _controller: BulletMoveController | null = null;
    private _collider: Collider | null = null;

    update(dt: number) {
        this._lastTime += dt;
        let fixedTime = this._lastTime / this._fixedTimeStep;
        for (let i = 0; i < fixedTime; i++) {
            this.fixedUpdate();
        }
        this._lastTime = this._lastTime % this._fixedTimeStep;
    }

    fixedUpdate() {
        if (this._data.delayTime > 0) {
            this._data.delayTime -= this._fixedTimeStep;
        } else {
            this.runLifeTime(this._fixedTimeStep);
        }

        if (this.checkIsOut()) {
            this.bulletDead();
            return;
        }
    }

    onTriggerEnter() {
        if (this._data.boundaryCheck) {
            this.bulletDead();
        }
    }

    reuse(arg: any) {
        this.setPool(arg[0]);
    }

    unuse() {

    }

    private bulletDead() {
        if (this._collider !== null) {
            this._collider.off('onTriggerEnter', this.onTriggerEnter, this);
            this._collider.destroy();
        }
        if (this._controller !== null) {
            this._controller.destroy();
        }
        this._bulletPool.put(this.node);
    }

    public init(data: BulletData, collider: Collider | null, controller: BulletMoveController | null) {
        this._data = data;
        this._damage = this._data.damage;

        this._collider = collider;
        this._controller = controller;

        if (this._collider !== null) {
            this._collider.isTrigger = true;
            this._collider.on('onTriggerEnter', this.onTriggerEnter, this);
        }

        if (this._controller !== null) {
            this._controller.init();
        }
    }

    public setPool(bulletPool: NodePool) {
        this._bulletPool = bulletPool;
    }

    /**
     * 判断是否出界
     */
    protected checkIsOut(): boolean {
        if (this._data.boundaryCheck) {
            return this.node.position.x < SpaceAttack.allowedArea.xMin - this._data.radius || this.node.position.x > SpaceAttack.allowedArea.xMax + this._data.radius || this.node.position.y < SpaceAttack.allowedArea.yMin - this._data.radius || this.node.position.y > SpaceAttack.allowedArea.yMax + this._data.radius;
        } else {
            return false;
        }
    }

    /**
     * 减少子弹生命时间
     */
    protected runLifeTime(dt: number) {
        if (this._data.lifeTime != Infinity) {
            this._data.lifeTime -= dt;
            if (this._data.lifeTime <= 0) {
                this.bulletDead();
            }
        }
    }
}
