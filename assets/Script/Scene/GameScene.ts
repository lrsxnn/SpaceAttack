import { EnemyDataParam } from './../Data/EnemyData';
import { SpacecraftDataParam } from './../Data/SpacecraftData';
import { Spacecraft } from './../Prefab/Spacecraft';
import { Bullet } from './../Prefab/Bullet';
import { Enemy } from './../Prefab/Enemy';
import { Tag } from './../Tools/Tag';
import { EnemyFactory } from './../Data/EnemyFactory';
import { _decorator, Component, Node, systemEvent, SystemEventType, EventKeyboard, Prefab, NodePool, Vec3, instantiate, log, Camera, find } from 'cc';
import { EnemyData } from '../Data/EnemyData';
import { SpacecraftData } from '../Data/SpacecraftData';
const { ccclass, property } = _decorator;

const START_POS = [new Vec3(-5, -10, 0), new Vec3(5, -10, 0)];

@ccclass('GameScene')
export class GameScene extends Component {
    @property(Prefab)
    spacecraft: Prefab = null!;
    @property(Prefab)
    enemy: Prefab = null!;
    @property(Camera)
    camera: Camera = null!;
    @property(Prefab)
    spacecraftName: Prefab = null!;

    private _enemyFactory: EnemyFactory = new EnemyFactory();
    private _startPoint = [0, 1];

    /**
     * 清除画面
     */
    public cleanScene() {
        for (let i = this.node.children.length - 1; i >= 0; i--) {
            let node = this.node.children[i];
            if (node.name.startsWith("spacecraft")) {
                node.destroy();
            } else if (node.name.startsWith("enemy")) {
                node.getComponent(Enemy)!.dead();
            } else if (node.name.startsWith("bullet")) {
                node.getComponent(Bullet)!.dead();
            }
        }
        this._startPoint = [0, 1];
    }

    /**
     * 创建飞船
     */
    public createSpacecraft(id: string, name: string) {
        if (this.node.getChildByName(`spacecraft${id}`)) {
            log(`该玩家已经加入${id}`);
            return;
        }

        let canvas = find("Canvas");
        if (canvas) {
            let spacecraft = instantiate(this.spacecraft);
            this.node.addChild(spacecraft);

            let nameNode = instantiate(this.spacecraftName);
            canvas.addChild(nameNode);

            let param: SpacecraftDataParam = {
                id: id,
                name: name,
                position: START_POS[this._startPoint[0]]
            }
            let data: SpacecraftData = new SpacecraftData(param);
            spacecraft.getComponent(Spacecraft)!.init(data, nameNode, this.camera);

            spacecraft.getComponent(Tag)!.tag = this._startPoint.shift();
            spacecraft.name = `spacecraft${id}`;
        }
    }

    /**
     * 查找最近的敌人
     */
    public getNearestEnemy(spacecraft: Vec3): Node | null {
        let length = Infinity;
        let _enemy = null;

        for (let i = 0; i < this.node.children.length; i++) {
            let node = this.node.children[i];
            if (node.name.startsWith("enemy")) {
                let distance = Vec3.distance(spacecraft, node.position);
                if (distance < length) {
                    length = distance;
                    _enemy = node;
                }
            }
        }
        return _enemy;
    }

    /**
     * 移除飞船
     */
    public removeSpacecraft(id: string) {
        let spacecraft = this.node.getChildByName(`spacecraft${id}`);
        if (spacecraft) {
            this._startPoint.push(spacecraft.getComponent(Tag)!.tag);
            this._startPoint.sort();
            spacecraft.destroy();
        }
    }

    /**
     * 游戏开始
     */
    public startGame() {
        let param: EnemyDataParam = {};
        this._enemyFactory.createEnemy(this.enemy, this.node, 0, new EnemyData(param));
    }

    public setSpacecraftPosition(id: string, pos: Vec3) {
        let spacecraft = this.node.getChildByName(`spacecraft${id}`);
        if (spacecraft) {
            spacecraft.position = pos;
        }
    }
}
