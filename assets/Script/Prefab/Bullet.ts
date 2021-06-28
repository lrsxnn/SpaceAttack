import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Component, Node, SphereCollider, Vec3, NodePool, sp } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('Bullet')
export class Bullet extends Component {
    @property
    speed = 0.05;

    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;
    private _radius: number = 0.5;
    private _velocity: Vec3 = new Vec3();
    private _bulletPool: NodePool = null!;

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
    }

    fixedUpdate() {
        let lastPos = this.node.position.clone();

        if (lastPos.x < SpaceAttack.allowedArea.xMin - this._radius || lastPos.x > SpaceAttack.allowedArea.xMax + this._radius || lastPos.y < SpaceAttack.allowedArea.yMin - this._radius || lastPos.y > SpaceAttack.allowedArea.yMax + this._radius) {
            this._bulletPool.put(this.node);
            return;
        }

        let desiredVelocity = new Vec3();
        Vec3.multiplyScalar(desiredVelocity, this._velocity, this.speed);
        lastPos.add(desiredVelocity);

        this.node.setPosition(lastPos);
    }

    move(velocity: Vec3, speed: number) {
        this.speed = speed;
        this._velocity = velocity;
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
