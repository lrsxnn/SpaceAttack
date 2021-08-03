
import { _decorator, Vec3, Quat } from 'cc';
const { ccclass } = _decorator;

@ccclass('SpacecraftData')
export class SpacecraftData {
    public id: string = "";
    public name: string = "";
    public hp: number = 100;
    public speed: number = 0.05;

    public scale: Vec3 = new Vec3();
    public position: Vec3 = new Vec3();
    public rotation: Quat = new Quat();

    constructor(param: SpacecraftDataParam) {
        this.id = param.id;
        this.name = param.name;
        this.hp = typeof (param.hp) === 'number' ? param.hp : 100;
        this.speed = typeof (param.speed) === 'number' ? param.speed : 0.05;
        this.scale = param.scale !== undefined ? param.scale : new Vec3(1, 2, 1);
        this.position = param.position !== undefined ? param.position : new Vec3(0, -10, 0);
        this.rotation = param.rotation !== undefined ? param.rotation : Quat.fromAngleZ(new Quat(), 0);
    }
}

export interface SpacecraftDataParam {
    id: string,
    name: string,
    hp?: number,
    speed?: number,
    scale?: Vec3,
    position?: Vec3,
    rotation?: Quat
}
