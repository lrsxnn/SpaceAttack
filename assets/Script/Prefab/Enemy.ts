import { EnemyMoveController } from './../Component/MoveController/EnemyMoveController';
import { EnemyData } from './../Data/EnemyData';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { Bullet } from './Bullet';
import { NotificationMessage } from './../Notification/NotificationMessage';

import { _decorator, ITriggerEvent } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
import Decimal from '../Plugin/decimal.js';
import { FlyNode } from '../Component/FlyNode';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends FlyNode {
    private _data: EnemyData = null!;
    public get data(): EnemyData {
        return this._data;
    }

    public get damage(): Decimal {
        return this._data.damage;
    }

    protected _controller: EnemyMoveController = null!;

    onLoad() {
        if (!SpaceAttack.ConstValue.pause) {
            this.onPauseExit();
        }
        this._controller = this.node.getComponent(EnemyMoveController)!;
    }

    start() {
        this.schedule(() => {
            NotificationCenter.sendNotification(NotificationMessage.ENEMY_FIRE, this.node.position.clone());
        }, 1);
        // BulletEd.notifyEvent(NotificationMessage.ENEMY_FIRE, this.node.position.clone());
        // NotificationCenter.sendNotification(NotificationMessage.ENEMY_FIRE, this.node.position.clone());
    }

    protected onTriggerEnter(event: ITriggerEvent) {
        this.onTriggerStay(event);
    }
    protected onTriggerStay(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let bullet = node.getComponent(Bullet)
        if (bullet) {
            this._data.hp = this._data.hp.sub(bullet.damage);
        }
        if (this._data.hp.lessThanOrEqualTo(0)) {
            this.dead();
        }
    }

    public init(data: EnemyData) {
        this._data = data;
        this._controller.init();
    }
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
