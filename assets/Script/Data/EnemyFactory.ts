import { EnemyData } from './EnemyData';
import { Enemy } from './../Prefab/Enemy';

import { _decorator, Prefab, NodePool, instantiate, Node } from 'cc';
const { ccclass } = _decorator;

@ccclass('EnemyFactory')
export class EnemyFactory {
    private _enemyPool: NodePool = new NodePool('Enemy');

    public createEnemy(prefab: Prefab, parent: Node, idx: number, data: EnemyData) {
        let enemy = null;
        if (this._enemyPool.size() > 0) {
            enemy = this._enemyPool.get(this._enemyPool);
        } else {
            enemy = instantiate(prefab);
            enemy!.getComponent(Enemy)!.setPool(this._enemyPool);
        }
        parent.addChild(enemy!);
        enemy!.name = `enemy${idx}`;
        enemy!.getComponent(Enemy)!.init(data);
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
