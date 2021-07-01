import { Node, Vec3, Quat, sp } from 'cc';
import { EventDispatcher } from './../Notification/EventDispatcher';

export const BulletEd = new EventDispatcher();
export class BulletData {
    /** @param 坐标 */
    public position: Vec3 = new Vec3();
    /** @param 旋转角度 */
    public rotation: Quat = new Quat();
    /** @param 速度 */
    public velocity: Vec3 = new Vec3();
    /** @param 移动方向 */
    public inputDirection: Vec3 = new Vec3();
    /** @param 移动快慢 */
    public speed: number = 10;
    /**  @param 加速度 */
    public acceleration: number = 0;

    /** @param 延迟变化时间 */
    public delayTime: number = 0;
    /** @param 目标节点 */
    public targetNode: Node | null = null;

    /**
     * @param position 坐标
     * @param rotation 旋转角度
     * @param inputDirection 移动方向
     * @param speed 移动快慢
     * @param acceleration 加速度
     */
    constructor(position: Vec3, rotation: number = 0, inputDirection: Vec3 = Vec3.UP.clone(), speed: number = 10, acceleration: number = 0) {
        this.position = position;
        Quat.fromAngleZ(this.rotation, -rotation);
        this.inputDirection = inputDirection;
        this.speed = speed;
        this.acceleration = acceleration;
        Vec3.multiplyScalar(this.velocity, this.inputDirection, this.speed);
    }

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
}

