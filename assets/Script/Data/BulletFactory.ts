import { BulletData } from './BulletData';
import { Bullet } from './../Prefab/Bullet';
import { Node, Prefab, NodePool, instantiate, Vec3 } from 'cc';

export class BulletFactory {
    /**
     * 创建直线飞行的子弹
     * @param bullet 子弹
     * @param startPosition 初始位置
     * @param speed 速度
     * @param inputDirection 方向
     * @param rotation 旋转角度
     */
    public createStraightLineBullet(bullet: Bullet, startPosition: Vec3, speed: number, inputDirection: Vec3, rotation: number) {
        let data = new BulletData(startPosition, rotation, inputDirection, speed);
        bullet.init(data);
    }

    /**
     * 创建追踪子弹
     * @param bullet 子弹
     * @param startPosition 初始位置
     * @param speed 速度
     * @param inputDirection 方向
     * @param rotation 旋转角度
     * @param targetNode 目标节点
     */
    public createTrackingBullet(bullet: Bullet, startPosition: Vec3, speed: number, inputDirection: Vec3, rotation: number, targetNode: Node) {
        let data = new BulletData(startPosition, rotation, inputDirection, speed);
        data.targetNode = targetNode;
        data.delayTime = 0.1;
        bullet.init(data);
    }

    /**
     * 创建子弹
     * @param prefab 子弹prefab
     * @param pool 子弹池
     * @param parent 父节点
     */
    public getBulletFromPool(prefab: Prefab, pool: NodePool, parent: Node): Bullet {
        let bullet = null;
        if (pool.size() > 0) {
            bullet = pool.get(pool);
        } else {
            bullet = instantiate(prefab);
            bullet!.getComponent(Bullet)!.setPool(pool);
        }

        parent.addChild(bullet!);

        return bullet!.getComponent(Bullet)!;
    }
}
