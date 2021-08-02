import { RotaryStarBulletMoveController } from './../Component/BulletMoveController/RotaryStarBulletMoveController';
import { LaserBulletMoveController } from './../Component/BulletMoveController/LaserBulletMoveController';
import { TrackingBulletMoveController } from './../Component/BulletMoveController/TrackingBulletMoveController';
import { StraightLineBulletMoveController } from './../Component/BulletMoveController/StraightLineBulletMoveController';
import { BulletData, BULLET_MOVE_TYPE, BULLET_COLLIDER_TYPE } from './BulletData';
import { Bullet } from './../Prefab/Bullet';
import { Node, Prefab, NodePool, instantiate, Mesh, MeshRenderer, Collider, SphereCollider, ConeCollider, CylinderCollider } from 'cc';
import { BulletMoveController } from '../Component/BulletMoveController/BulletMoveController';

export class BulletFactory {
    /**
     * 创建子弹
     * @param prefab 子弹prefab
     * @param pool 子弹池
     * @param parent 父节点
     */
    public createBullet(prefab: Prefab, pool: NodePool, parent: Node, mesh: Mesh, data: BulletData) {
        let bullet = null;
        if (pool.size() > 0) {
            bullet = pool.get(pool);
        } else {
            bullet = instantiate(prefab);
            bullet!.getComponent(Bullet)!.setPool(pool);
        }
        parent.addChild(bullet!);
        bullet!.name = "bullet";

        //必须先设置父节点再更改mesh
        bullet!.getComponent(MeshRenderer)!.mesh = mesh;

        let collider = this.addCollider(data.colliderType, bullet!);
        let controller = this.addMoveController(data.moveType, bullet!);
        bullet!.getComponent(Bullet)!.init(data, collider, controller);
    }

    private addCollider(type: BULLET_COLLIDER_TYPE, bullet: Node): Collider | null {
        let collider: Collider | null = null;
        switch (type) {
            case BULLET_COLLIDER_TYPE.SPHERE:
                collider = bullet.addComponent(SphereCollider);
                break;
            case BULLET_COLLIDER_TYPE.CONE:
                collider = bullet.addComponent(ConeCollider);
                break;
            case BULLET_COLLIDER_TYPE.CYLINDER:
                collider = bullet.addComponent(CylinderCollider);
                break;
        }
        return collider;
    }

    private addMoveController(type: BULLET_MOVE_TYPE, bullet: Node): BulletMoveController | null {
        let controller: BulletMoveController | null = null;
        switch (type) {
            case BULLET_MOVE_TYPE.STRAIGHTLINE:
                controller = bullet.addComponent(StraightLineBulletMoveController);
                break;
            case BULLET_MOVE_TYPE.TRACKING:
                controller = bullet.addComponent(TrackingBulletMoveController);
                break;
            case BULLET_MOVE_TYPE.LASER:
                controller = bullet.addComponent(LaserBulletMoveController);
                break;
            case BULLET_MOVE_TYPE.ROTARYSTAR:
                controller = bullet.addComponent(RotaryStarBulletMoveController);
                break;
        }
        return controller;
    }
}
