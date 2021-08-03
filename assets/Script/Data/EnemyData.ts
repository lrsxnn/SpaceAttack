import { _decorator, Vec3, Quat } from 'cc';
const { ccclass } = _decorator;

@ccclass('EnemyData')
export class EnemyData {
    public hp: number = 100;
    public scale: Vec3 = new Vec3();
    public position: Vec3 = new Vec3();
    public rotation: Quat = new Quat();
}
