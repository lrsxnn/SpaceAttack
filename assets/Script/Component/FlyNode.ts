import { BaseComponent } from './BaseComponent';

import { _decorator, NodePool, Collider, ITriggerEvent } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FlyNode')
export abstract class FlyNode extends BaseComponent {
    private _pool: NodePool = null!;
    protected _collider: Collider | null = null;
    public isAlive = false;

    public reuse(arg: any) {
        this.setPool(arg[0]);
    }

    public unuse() {

    }

    onPauseExit() {
        if (this._collider === null) {
            this.node.getComponent(Collider)!.on('onTriggerEnter', this.onTriggerEnter, this);
            this.node.getComponent(Collider)!.on('onTriggerStay', this.onTriggerStay, this);
        } else {
            this._collider.on('onTriggerEnter', this.onTriggerEnter, this);
            this._collider.on('onTriggerStay', this.onTriggerStay, this);
        }
    }

    onPauseEnter() {
        if (this._collider === null) {
            this.node.getComponent(Collider)!.off('onTriggerEnter', this.onTriggerEnter, this);
            this.node.getComponent(Collider)!.off('onTriggerStay', this.onTriggerStay, this);
        } else {
            this._collider.off('onTriggerEnter', this.onTriggerEnter, this);
            this._collider.off('onTriggerStay', this.onTriggerStay, this);
        }
    }

    public setPool(_pool: NodePool) {
        this._pool = _pool;
        this.isAlive = true;
    }

    public dead() {
        this._pool.put(this.node);
        this.isAlive = false;
    }

    protected abstract onTriggerEnter(event: ITriggerEvent): void;
    protected abstract onTriggerStay(event: ITriggerEvent): void;
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
