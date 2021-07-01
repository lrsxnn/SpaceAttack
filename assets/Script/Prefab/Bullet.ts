import { BulletData } from './../Data/BulletData';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Component, SphereCollider, Vec3, NodePool, error, Quat, Vec2 } from 'cc';
const { ccclass } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;
    //半径
    private _radius: number = 0.5;

    private _data: BulletData = null!;

    private _bulletPool: NodePool = null!;

    init(data: BulletData) {
        this._data = data;

        this.node.setPosition(this._data.position);
        this.node.setRotation(this._data.rotation);
    }

    onLoad() {
        this._radius = this.node.getComponent(SphereCollider)!.radius;

        this.node.getComponent(SphereCollider)!.on('onTriggerEnter', this.onTriggerEnter, this);
    }

    onTriggerEnter() {
        this._bulletPool.put(this.node);
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
            //根据目标位置调整旋转角度以及前进方向
            if (this._data.targetNode !== null && this._data.targetNode.isValid) {
                let newDirection = new Vec2(this._data.targetNode.position.x - this.node.position.x, this._data.targetNode.position.y - this.node.position.y);

                let angle = newDirection.signAngle(Vec2.UNIT_Y) * 180 / Math.PI;
                Quat.fromAngleZ(this._data.rotation, -angle);
                this.node.setRotation(this._data.rotation);

                newDirection = SpaceAttack.UnityVec2.clampMagnitude(newDirection, 1);
                this._data.changeVelocity(new Vec3(newDirection.x, newDirection.y, 0));
            }
        }

        this._data.position = this.node.position.clone();

        if (this._data.position.x < SpaceAttack.allowedArea.xMin - this._radius || this._data.position.x > SpaceAttack.allowedArea.xMax + this._radius || this._data.position.y < SpaceAttack.allowedArea.yMin - this._radius || this._data.position.y > SpaceAttack.allowedArea.yMax + this._radius) {
            this._bulletPool.put(this.node);
            return;
        }

        let desiredVelocity = new Vec3();
        Vec3.multiplyScalar(desiredVelocity, this._data.inputDirection, this._data.speed);
        let maxSpeedChange = this._data.acceleration * dt;
        this._data.velocity.x = SpaceAttack.UnityMathf.moveTowards(this._data.velocity.x, desiredVelocity.x, maxSpeedChange);
        this._data.velocity.y = SpaceAttack.UnityMathf.moveTowards(this._data.velocity.y, desiredVelocity.y, maxSpeedChange);

        let displacement = new Vec3();
        Vec3.multiplyScalar(displacement, this._data.velocity, dt);
        this._data.position.add(displacement);

        this.node.setPosition(this._data.position);
    }

    fixedUpdate() {

    }

    unuse() {

    }

    reuse(arg: any) {
        this.setPool(arg[0]);
    }

    setPool(bulletPool: NodePool) {
        this._bulletPool = bulletPool;
    }
}
