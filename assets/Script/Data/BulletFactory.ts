import { BulletData } from './BulletData';
import { Bullet } from './../Prefab/Bullet';
import { Node, Prefab, NodePool, instantiate, Vec3, Mesh, MeshRenderer, SphereCollider, ConeCollider, CylinderCollider } from 'cc';

export class BulletFactory {
    /**
     * 直线飞行的子弹数据
     * @param startPosition 初始位置
     * @param speed 速度
     * @param inputDirection 方向
     * @param rotation 旋转角度
     * @param radius 半径
     * @returns BulletData
     */
    public createStraightLineBulletData(startPosition: Vec3, speed: number, inputDirection: Vec3, rotation: number, radius: number): BulletData {
        let data = new BulletData(startPosition, rotation, inputDirection, speed);
        data.radius = radius;
        return data;
    }

    /**
     * 追踪弹数据
     * @param startPosition 初始位置
     * @param speed 速度
     * @param inputDirection 方向
     * @param rotation 旋转角度
     * @param radius 半径
     * @param height 高度
     * @param targetNode 目标节点
     * @param delayTime 延迟时间
     * @returns BulletData
     */
    public createTrackingBulletData(startPosition: Vec3, speed: number, inputDirection: Vec3, rotation: number, radius: number, height: number, targetNode: Node, delayTime: number) {
        let data = new BulletData(startPosition, rotation, inputDirection, speed);
        data.radius = radius;
        data.height = height;
        data.targetNode = targetNode;
        data.delayTime = delayTime;
        return data;
    }

    /**
     * 激光数据
     * @param startPosition 初始位置
     * @param inputDirection 方向
     * @param rotation 旋转角度
     * @param radius 半径
     * @param height 高度
     * @param targetNode 目标节点
     * @param delayTime 延迟时间
     * @param lifeTime 持续时间
     * @returns BulletData
     */
    public createLaserBulletData(startPosition: Vec3, inputDirection: Vec3, rotation: number, radius: number, height: number, targetNode: Node | null = null, delayTime: number = 0, lifeTime: number = 0) {
        let data = new BulletData(startPosition, rotation, inputDirection, 0);
        data.radius = radius;
        data.height = height;
        data.targetNode = targetNode;
        data.delayTime = delayTime;
        data.lifeTime = lifeTime;
        data.boundaryCheck = false;
        return data;
    }

    /**
     * 创建子弹
     * @param prefab 子弹prefab
     * @param pool 子弹池
     * @param parent 父节点
     */
    public createBullet(prefab: Prefab, pool: NodePool, parent: Node, mesh: Mesh): Bullet {
        let bullet = null;
        if (pool.size() > 0) {
            bullet = pool.get(pool);
        } else {
            bullet = instantiate(prefab);
            bullet!.getComponent(Bullet)!.setPool(pool);
        }
        bullet!.getComponent(MeshRenderer)!.mesh = mesh;

        parent.addChild(bullet!);

        return bullet!.getComponent(Bullet)!;
    }

    /**
     * 创建球形子弹
     */
    public createSphereBullet(prefab: Prefab, pool: NodePool, parent: Node, mesh: Mesh, data: BulletData) {
        let bullet = this.createBullet(prefab, pool, parent, mesh);
        data.scaleX = data.radius * 2;
        data.scaleY = data.radius * 2;
        let collider = bullet.node.addComponent(SphereCollider);
        collider!.isTrigger = true;
        bullet.init(data);
    }

    /**
     * 创建圆锥形子弹
     */
    public createConeBullet(prefab: Prefab, pool: NodePool, parent: Node, mesh: Mesh, data: BulletData) {
        let bullet = this.createBullet(prefab, pool, parent, mesh);
        data.scaleX = data.radius * 2;
        data.scaleY = data.height;
        let collider = bullet.node.addComponent(ConeCollider);
        collider!.isTrigger = true;
        bullet.init(data);
    }

    /**
     * 创建圆柱形子弹
     */
    public createCylinderBullet(prefab: Prefab, pool: NodePool, parent: Node, mesh: Mesh, data: BulletData) {
        let bullet = this.createBullet(prefab, pool, parent, mesh);
        data.scaleX = data.radius * 2;
        data.scaleY = data.height;
        let collider = bullet.node.addComponent(CylinderCollider);
        collider!.isTrigger = true;
        bullet.init(data);
    }
}
