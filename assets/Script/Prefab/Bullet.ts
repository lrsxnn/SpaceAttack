import { BulletData } from './../Data/BulletData';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Collider, ITriggerEvent } from 'cc';
import { BulletMoveController } from '../Component/MoveController/BulletMoveController';
import Decimal from '../Plugin/decimal.js';
import { FlyNode } from '../Component/FlyNode';
const { ccclass } = _decorator;

@ccclass('Bullet')
export class Bullet extends FlyNode {
    private _data: BulletData = null!;
    public get data(): BulletData {
        return this._data;
    }

    public get damage(): Decimal {
        return this._data.damage;
    }

    protected _controller: BulletMoveController | null = null;

    // private _temp_pos = new Decimal(0);

    onUpdate(dt: number) {
        // if (this.node.name === "bullet1")
        // error(`onUpdate ${this.node.name} pos ${this._data.position.toVec3().toString()}`);

        if (this.checkIsOut()) {
            this.dead();
        }
    }

    onFixedUpdate() {
        this.runLifeTime(this._fixedTimeStep);
    }

    protected onTriggerStay(event: ITriggerEvent) {

    }

    protected onTriggerEnter(event: ITriggerEvent) {
        if (this._data.boundaryCheck) {
            this.dead();
        }
    }

    public dead() {
        // error(`dead ${this.node.name}`);
        if (this._collider !== null) {
            this._collider.off('onTriggerEnter', this.onTriggerEnter, this);
            this._collider.destroy();
        }
        if (this._controller !== null) {
            this._controller.destroy();
        }
        super.dead();
    }

    public init(data: BulletData, collider: Collider | null, controller: BulletMoveController | null) {
        this._data = data;
        // Object.defineProperty(this._data.position, "x", {
        //     get: () => {
        //         return this._temp_pos;
        //     },
        //     set: (value) => {
        //         if (this.node.name === "bullet1")
        //             error(`${this.node.name} defineProperty = ${value}`);
        //         this._temp_pos = value;
        //     }
        // });

        this._collider = collider;
        this._controller = controller;

        if (this._collider !== null) {
            this._collider.isTrigger = true;
            if (!SpaceAttack.ConstValue.pause) {
                this.onPauseExit();
            }
        }

        if (this._controller !== null) {
            this._controller.init();
        }
    }

    /**
     * 判断是否出界
     */
    protected checkIsOut(): boolean {
        if (this._data.boundaryCheck) {
            // if (this.node.name === "bullet1")
            // error(`${this.node.name} x = ${this._data.position.x.toString()} y = ${this._data.position.y.toString()} xMin ${this._data.position.x.lessThan(SpaceAttack.ConstValue.allowedArea.xMin.sub(this._data.radius))} xMax ${this._data.position.x.greaterThan(SpaceAttack.ConstValue.allowedArea.xMax.add(this._data.radius))} yMin ${this._data.position.y.lessThan(SpaceAttack.ConstValue.allowedArea.yMin.sub(this._data.height))} yMax ${this._data.position.y.greaterThan(SpaceAttack.ConstValue.allowedArea.yMax.add(this._data.height))}`);

            return this._data.position.x.lessThan(SpaceAttack.ConstValue.allowedArea.xMin.sub(this._data.radius)) || this._data.position.x.greaterThan(SpaceAttack.ConstValue.allowedArea.xMax.add(this._data.radius)) || this._data.position.y.lessThan(SpaceAttack.ConstValue.allowedArea.yMin.sub(this._data.height)) || this._data.position.y.greaterThan(SpaceAttack.ConstValue.allowedArea.yMax.add(this._data.height));
        } else {
            return false;
        }
    }

    /**
     * 减少子弹生命时间
     */
    protected runLifeTime(dt: Decimal) {
        if (!this._data.lifeTime.equals(Infinity)) {
            this._data.lifeTime = this._data.lifeTime.sub(dt);
            if (this._data.lifeTime.lessThanOrEqualTo(0)) {
                this.dead();
            }
        }
    }
}
