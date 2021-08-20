import { DecimalVec3 } from './../Plugin/DecimalVec3';
import { DecimalQuat } from './../Plugin/DecimalQuat';
import { Node, Vec3, Quat } from 'cc';
import Decimal from '../Plugin/decimal.js';
import { EventDispatcher } from './../Notification/EventDispatcher';

export const BulletEd = new EventDispatcher();
export class BulletData {
    /** @param 移动方式 */
    public moveType: BULLET_MOVE_TYPE;
    /** @param 碰撞类型 */
    public colliderType: BULLET_COLLIDER_TYPE;
    /** @param 坐标 */
    public position: DecimalVec3 = new DecimalVec3();
    /** @param 角度 */
    public angle: Decimal = new Decimal(0);
    /** @param 移动方向 */
    public inputDirection: DecimalVec3 = new DecimalVec3();
    /** @param 移动快慢 */
    public speed: Decimal = new Decimal(0);
    /** @param 伤害 */
    public damage: Decimal = new Decimal(1);
    /**  @param 加速度 */
    public acceleration: Decimal = new Decimal(0);
    /**  @param 半径 */
    public radius: Decimal = new Decimal(0.5);
    /** @param 高度 */
    public height: Decimal = new Decimal(1);

    /** @param 旋转角度 */
    public rotation: DecimalQuat = new DecimalQuat();
    /** @param 速度 */
    public velocity: DecimalVec3 = new DecimalVec3();
    /** @param 缩放 */
    public scale: DecimalVec3 = new DecimalVec3();

    /** @param 延迟变化时间 */
    public delayTime: Decimal = new Decimal(0);
    /** @param 目标节点 */
    public targetNode: Node | null = null;
    /** @param 持续时间 */
    public lifeTime: Decimal = new Decimal(Infinity);
    /** @param 边界检查开关 */
    public boundaryCheck = true;
    /** @param 跟随节点 */
    public followNode: Node | null = null;
    /** @param 跟随距离 */
    public followPosition: DecimalVec3 | null = null;

    constructor(data: BulletBaseDataParam) {
        this.moveType = data.moveType;
        this.colliderType = data.colliderType;
        this.position.set(data.position);

        this.angle = data.angle instanceof Decimal ? data.angle.neg() : new Decimal(-data.angle);
        this.inputDirection.set(data.inputDirection);

        if (data.damage) {
            this.damage = data.damage instanceof Decimal ? data.damage : new Decimal(data.damage);
        }

        if (data.radius) {
            this.radius = data.radius instanceof Decimal ? data.radius : new Decimal(data.radius);
        }
        if (data.height) {
            this.height = data.height instanceof Decimal ? data.height : new Decimal(data.height);
        }

        if (data.speed) {
            this.speed = data.speed instanceof Decimal ? data.speed : new Decimal(data.speed);
        }
        if (data.acceleration) {
            this.acceleration = data.acceleration instanceof Decimal ? data.acceleration : new Decimal(data.acceleration);
        }
        if (data.lifeTime) {
            this.lifeTime = data.lifeTime instanceof Decimal ? data.lifeTime : new Decimal(data.lifeTime);
        }

        DecimalQuat.fromAngleZ(this.rotation, this.angle);
        DecimalVec3.multiplyScalar(this.velocity, this.inputDirection, this.speed);

        switch (this.colliderType) {
            case BULLET_COLLIDER_TYPE.SPHERE:
                this.scale.x = this.radius.mul(2)
                this.scale.y = this.radius.mul(2);
                break;
            case BULLET_COLLIDER_TYPE.CONE:
                this.scale.x = this.radius.mul(2);
                this.scale.y = this.height;
                break;
            case BULLET_COLLIDER_TYPE.CYLINDER:
                this.scale.x = this.radius.mul(2);
                this.scale.y = this.height;
                break;
        }
    }

    /**
     * 变换速度
     */
    public changeVelocity(direction?: DecimalVec3 | Vec3, speed?: Decimal | number, velocity?: DecimalVec3 | Vec3) {
        if (velocity) {
            this.velocity.set(velocity);
        } else {
            if (speed) {
                this.speed = speed instanceof Decimal ? speed : new Decimal(speed);
            }
            if (direction) {
                this.inputDirection.set(direction);
            }
            DecimalVec3.multiplyScalar(this.velocity, this.inputDirection, this.speed);
        }
    }

    /**
     * 设置追踪属性
     */
    public setTrackingData(delayTime: Decimal | number, targetNode: Node | null) {
        this.delayTime = delayTime instanceof Decimal ? delayTime : new Decimal(delayTime);
        this.targetNode = targetNode;
    }

    /**
     * 设置激光属性
     */
    public setLaserData(delayTime: Decimal | number, followNode: Node, followPosition: DecimalVec3 | Vec3, lifeTime?: Decimal | number) {
        this.delayTime = delayTime instanceof Decimal ? delayTime : new Decimal(delayTime);
        this.followNode = followNode;
        if (this.followPosition === null){
            this.followPosition = new DecimalVec3();
        }
        this.followPosition.set(followPosition);
        if (lifeTime) {
            this.lifeTime = lifeTime instanceof Decimal ? lifeTime : new Decimal(lifeTime);
        }

        this.boundaryCheck = false;
        DecimalVec3.add(this.position, new DecimalVec3(this.followNode!.position), this.followPosition!);
    }

    public setRotaryStarData() {
        this.boundaryCheck = false;
        this.scale.x = this.radius.mul(this.angle).div(360);
        this.scale.y = this.radius.mul(this.angle).div(360);
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
    position: DecimalVec3 | Vec3;
    /** @param 旋转角度 */
    angle: Decimal | number;
    /** @param 移动方向 */
    inputDirection: DecimalVec3 | Vec3;

    /** @param 伤害 */
    damage?: Decimal | number;

    /**  @param 半径 */
    radius?: Decimal | number;
    /** @param 高度 */
    height?: Decimal | number;

    /** @param 移动快慢 */
    speed?: Decimal | number;
    /**  @param 加速度 */
    acceleration?: Decimal | number;
    /** @param 持续时间 */
    lifeTime?: Decimal | number;
}
