import { EnemyData } from './../Data/EnemyData';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { BaseComponent } from './../Component/BaseComponent';
import { Bullet } from './Bullet';
import { NotificationMessage } from './../Notification/NotificationMessage';

import { _decorator, Vec2, Vec3, BoxCollider, ITriggerEvent, NodePool } from 'cc';
import { BulletEd } from '../Data/BulletData';
import { SpaceAttack } from '../Tools/Tools';
const { ccclass, property } = _decorator;

@ccclass('Enemy')
export class Enemy extends BaseComponent {
    @property
    speed = 0.02;
    @property
    damage = 1;
    @property
    hp = 100;

    private _axisHorizontal = 0;
    private _axisVertical = 0;

    private _playerInput: Vec2 = new Vec2();
    private _desiredVelocity: Vec3 = new Vec3();
    private _lastPos: Vec3 = new Vec3();

    private _changePos = true;
    private _changePosTime = 0;

    private _enemyPool: NodePool = null!;

    onPauseExit() {
        this.node.getComponent(BoxCollider)!.on('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(BoxCollider)!.on('onTriggerStay', this.onTriggerStay, this);
    }

    onPauseEnter() {
        this.node.getComponent(BoxCollider)!.off('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(BoxCollider)!.off('onTriggerStay', this.onTriggerStay, this);
    }

    start() {
        this.schedule(() => {
            NotificationCenter.sendNotification(NotificationMessage.ENEMY_FIRE, this.node.position.clone());
        }, 1);
        // BulletEd.notifyEvent(NotificationMessage.ENEMY_FIRE, this.node.position.clone());
        // NotificationCenter.sendNotification(NotificationMessage.ENEMY_FIRE, this.node.position.clone());
    }

    onFixedUpdate() {
        this._changePosTime += this._fixedTimeStep;
        if (this._changePosTime > 2) {
            this._changePosTime -= 2;
            this._changePos = true;
        }

        if (this._changePos) {
            this._axisHorizontal = SpaceAttack.Utils.getRandomIntInclusive(-1, 1);
            this._axisVertical = SpaceAttack.Utils.getRandomIntInclusive(-1, 1);
            this._changePos = false;
        }

        this._playerInput.set(this._axisHorizontal, this._axisVertical);
        this._playerInput = SpaceAttack.UnityVec2.clampMagnitude(this._playerInput, 1);

        this._desiredVelocity.set(this._playerInput.x, this._playerInput.y, 0);
        this._desiredVelocity.multiplyScalar(this.speed);

        this._lastPos = this.node.position.clone();
        this._lastPos.add(this._desiredVelocity);

        if (this._lastPos.x < SpaceAttack.ConstValue.allowedArea.xMin) {
            this._lastPos.x = SpaceAttack.ConstValue.allowedArea.xMin;
        } else if (this._lastPos.x > SpaceAttack.ConstValue.allowedArea.xMax) {
            this._lastPos.x = SpaceAttack.ConstValue.allowedArea.xMax;
        }
        if (this._lastPos.y < SpaceAttack.ConstValue.allowedArea.yMin) {
            this._lastPos.y = SpaceAttack.ConstValue.allowedArea.yMin;
        } else if (this._lastPos.y > SpaceAttack.ConstValue.allowedArea.yMax) {
            this._lastPos.y = SpaceAttack.ConstValue.allowedArea.yMax;
        }
        this.node.setPosition(this._lastPos);
    }

    onTriggerStay(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let bullet = node.getComponent(Bullet)
        if (bullet) {
            this.hp -= bullet.damage;
        }

        if (this.hp <= 0) {
            this.enemyDead();
        }
    }

    reuse(arg: any) {
        this.setPool(arg[0]);
    }

    unuse() {

    }

    public init(data: EnemyData) {
        this.hp = 100;
        this._axisHorizontal = 0;
        this._axisVertical = 0;
        this._changePos = true;
        this._changePosTime = 0;
    }

    public setPool(enemyPool: NodePool) {
        this._enemyPool = enemyPool;
    }

    public enemyDead() {
        this._enemyPool.put(this.node);
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
