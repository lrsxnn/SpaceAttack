import { Node, Vec3, Quat } from 'cc';
import { EventDispatcher } from './../Notification/EventDispatcher';

export const BulletEd = new EventDispatcher();
export class BulletData {
    /** @param 移动方式 */
    public moveType: BULLET_MOVE_TYPE;
    /** @param 碰撞类型 */
    public colliderType: BULLET_COLLIDER_TYPE;
    /** @param 坐标 */
    public position: Vec3 = new Vec3();
    /** @param 角度 */
    public angle: number = 0;
    /** @param 移动方向 */
    public inputDirection: Vec3 = new Vec3();
    /** @param 移动快慢 */
    public speed: number = 10;
    /** @param 伤害 */
    public damage: number = 1;
    /**  @param 加速度 */
    public acceleration: number = 0;
    /**  @param 半径 */
    public radius: number = 0.5;
    /** @param 高度 */
    public height: number = 1;

    /** @param 旋转角度 */
    public rotation: Quat = new Quat();
    /** @param 速度 */
    public velocity: Vec3 = new Vec3();
    /** @param 缩放 */
    public scale: Vec3 = new Vec3();

    /** @param 延迟变化时间 */
    public delayTime: number = 0;
    /** @param 目标节点 */
    public targetNode: Node | null = null;
    /** @param 持续时间 */
    public lifeTime: number = Infinity;
    /** @param 边界检查开关 */
    public boundaryCheck = true;
    /** @param 跟随节点 */
    public followNode: Node | null = null;
    /** @param 跟随距离 */
    public followPosition: Vec3 | null = null;

    constructor(data: BulletBaseDataParam) {
        this.moveType = data.moveType;
        this.colliderType = data.colliderType;
        this.position = data.position;
        this.angle = -data.angle;
        this.inputDirection = data.inputDirection;
        this.damage = typeof data.radius === 'number' ? data.radius : 1;

        this.radius = typeof data.radius === 'number' ? data.radius : 0.5;
        this.height = typeof data.height === 'number' ? data.height : 1;

        this.speed = typeof data.speed === 'number' ? data.speed : 0;
        this.acceleration = typeof data.acceleration === 'number' ? data.acceleration : 0;
        this.lifeTime = typeof data.lifeTime === 'number' ? data.lifeTime : Infinity;

        Quat.fromAngleZ(this.rotation, -data.angle);
        Vec3.multiplyScalar(this.velocity, this.inputDirection, this.speed);

        switch (this.colliderType) {
            case BULLET_COLLIDER_TYPE.SPHERE:
                this.scale.x = this.radius * 2
                this.scale.y = this.radius * 2;
                break;
            case BULLET_COLLIDER_TYPE.CONE:
                this.scale.x = this.radius * 2;
                this.scale.y = this.height;
                break;
            case BULLET_COLLIDER_TYPE.CYLINDER:
                this.scale.x = this.radius * 2;
                this.scale.y = this.height;
                break;
        }
    }

    /**
     * 变换速度
     */
    public changeVelocity(direction?: Vec3, speed?: number, velocity?: Vec3) {
        if (velocity) {
            this.velocity = velocity;
        } else {
            if (speed != null) {
                this.speed = speed;
            }
            if (direction != null) {
                this.inputDirection = direction;
            }
            Vec3.multiplyScalar(this.velocity, this.inputDirection, this.speed);
        }
    }

    /**
     * 设置追踪属性
     */
    public setTrackingData(delayTime: number, targetNode: Node | null) {
        this.delayTime = delayTime;
        this.targetNode = targetNode;
    }

    /**
     * 设置激光属性
     */
    public setLaserData(delayTime: number, followNode: Node, followPosition: Vec3, lifeTime?: number) {
        this.delayTime = delayTime;
        this.followNode = followNode;
        this.followPosition = followPosition;
        this.lifeTime = typeof lifeTime === 'number' ? lifeTime : this.lifeTime;

        this.boundaryCheck = false;
        Vec3.add(this.position, this.followNode!.position.clone(), this.followPosition!);
    }

    public setRotaryStarData() {
        this.boundaryCheck = false;
        this.scale.x = this.radius * this.angle / 360;
        this.scale.y = this.radius * this.angle / 360;
    }
}

export enum BULLET_MOVE_TYPE {
    STRAIGHTLINE,
    TRACKING,
    LASER,
    ROTARYSTAR,
}

export enum BULLET_COLLIDER_TYPE {
    SPHERE,
    CONE,
    CYLINDER,
}

export interface BulletBaseDataParam {
    /** @param 移动方式 */
    moveType: BULLET_MOVE_TYPE;
    /** @param 碰撞类型 */
    colliderType: BULLET_COLLIDER_TYPE;
    /** @param 坐标 */
    position: Vec3;
    /** @param 旋转角度 */
    angle: number;
    /** @param 移动方向 */
    inputDirection: Vec3;

    /** @param 伤害 */
    damage?: number;

    /**  @param 半径 */
    radius?: number;
    /** @param 高度 */
    height?: number;

    /** @param 移动快慢 */
    speed?: number;
    /**  @param 加速度 */
    acceleration?: number;
    /** @param 持续时间 */
    lifeTime?: number;
}
