import { Bullet } from '../Bullet';

import { _decorator, Component, Vec2, Vec3 } from 'cc';
const { ccclass } = _decorator;

@ccclass('BulletMoveController')
export abstract class BulletMoveController extends Component {
    private _fixedTimeStep: number = 0.02;
    private _lastTime: number = 0;

    protected _bullet: Bullet = null!;
    protected _newDirection: Vec2 = new Vec2();
    protected _desiredVelocity: Vec3 = new Vec3();

    update(dt: number) {
        this._lastTime += dt;
        let fixedTime = this._lastTime / this._fixedTimeStep;
        for (let i = 0; i < fixedTime; i++) {
            this.fixedUpdate();
        }
        this._lastTime = this._lastTime % this._fixedTimeStep;
    }

    fixedUpdate() {
        if (this._bullet.data.delayTime > 0) {
            this._bullet.data.delayTime -= this._fixedTimeStep;
        } else {
            this.delayAction();
        }

        this._bullet.data.position = this.node.position.clone();

        this.moveAction(this._fixedTimeStep);

        this.node.setPosition(this._bullet.data.position);
    }

    public init() {
        this._bullet = this.getComponent(Bullet)!;

        this.node.setScale(new Vec3(this._bullet.data.scaleX, this._bullet.data.scaleY, 1));
        this.node.setPosition(this._bullet.data.position);
        this.node.setRotation(this._bullet.data.rotation);
    }

    /**
     * 延时动作
     */
    protected abstract delayAction(): void;

    /**
     * 移动
     */
    protected abstract moveAction(dt: number): void;
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
