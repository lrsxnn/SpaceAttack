import { BulletData } from './../Data/BulletData';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Component, Vec3, NodePool, Quat, Vec2, Collider, error } from 'cc';
const { ccclass } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;

    private _data: BulletData = null!;
    private _bulletPool: NodePool = null!;

    private _damage: number = 1;
    public get damage(): number {
        return this._damage;
    }

    update(dt: number) {
        this._lastTime += dt;
        let fixedTime = this._lastTime / this._fixedTimeStep;
        for (let i = 0; i < fixedTime; i++) {
            this.fixedUpdate();
        }
        this._lastTime = this._lastTime % this._fixedTimeStep;

        if (this._data.delayTime > 0) {
            this._data.delayTime -= dt;
        } else {
            this.runLifeTime(dt);
            this.lookAtTarget();
        }

        this._data.position = this.node.position.clone();

        if (this.checkIsOut()) {
            this.bulletDead();
            return;
        }

        if (this._data.followNode != null && this._data.followPosition != null) {//跟随目标
            Vec3.add(this._data.position, this._data.followNode.position.clone(), this._data.followPosition);
        } else {
            this.moveFoward(dt);
        }
        this.node.setPosition(this._data.position);
    }

    fixedUpdate() {

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
        let collider = this.node.getComponent(Collider);
        if (collider) {
            collider.off('onTriggerEnter', this.onTriggerEnter, this);
            collider.destroy();
        }
        this._bulletPool.put(this.node);
    }

    public init(data: BulletData) {
        this._data = data;
        this._damage = this._data.damage;

        this.node.setScale(new Vec3(this._data.scaleX, this._data.scaleY, 1));

        if (this._data.followNode != null && this._data.followPosition != null) {//跟随目标
            let startPos = new Vec3();
            Vec3.add(startPos, this._data.followNode.position.clone(), this._data.followPosition);
            this.node.setPosition(startPos);
        } else {
            this.node.setPosition(this._data.position);
        }
        this.node.setRotation(this._data.rotation);

        this.node.getComponent(Collider)!.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    public setPool(bulletPool: NodePool) {
        this._bulletPool = bulletPool;
    }

    /**
     * 判断是否出界
     */
    protected checkIsOut(): boolean {
        if (this._data.boundaryCheck) {
            return this._data.position.x < SpaceAttack.allowedArea.xMin - this._data.radius || this._data.position.x > SpaceAttack.allowedArea.xMax + this._data.radius || this._data.position.y < SpaceAttack.allowedArea.yMin - this._data.radius || this._data.position.y > SpaceAttack.allowedArea.yMax + this._data.radius;
        } else {
            return false;
        }
    }

    /**
     * 根据目标位置调整旋转角度以及前进方向
     */
    protected lookAtTarget() {
        if (this._data.targetNode !== null && this._data.targetNode.isValid) {
            let newDirection = new Vec2(this._data.targetNode.position.x - this.node.position.x, this._data.targetNode.position.y - this.node.position.y);

            let angle = newDirection.signAngle(Vec2.UNIT_Y) * 180 / Math.PI;
            Quat.fromAngleZ(this._data.rotation, -angle);
            this.node.setRotation(this._data.rotation);

            newDirection = SpaceAttack.UnityVec2.clampMagnitude(newDirection, 1);
            this._data.changeVelocity(new Vec3(newDirection.x, newDirection.y, 0));
        }
    }

    /**
     * 前进
     */
    protected moveFoward(dt: number) {
        let desiredVelocity = new Vec3();
        Vec3.multiplyScalar(desiredVelocity, this._data.inputDirection, this._data.speed);
        let maxSpeedChange = this._data.acceleration * dt;
        this._data.velocity.x = SpaceAttack.UnityMathf.moveTowards(this._data.velocity.x, desiredVelocity.x, maxSpeedChange);
        this._data.velocity.y = SpaceAttack.UnityMathf.moveTowards(this._data.velocity.y, desiredVelocity.y, maxSpeedChange);

        let displacement = new Vec3();
        Vec3.multiplyScalar(displacement, this._data.velocity, dt);
        this._data.position.add(displacement);
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
