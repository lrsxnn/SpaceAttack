import { DecimalQuat } from './../Plugin/DecimalQuat';
import { DecimalVec3 } from './../Plugin/DecimalVec3';
import { _decorator, Vec3, Quat } from 'cc';
import Decimal from '../Plugin/decimal.js';
const { ccclass } = _decorator;

@ccclass('SpacecraftData')
export class SpacecraftData {
    public id: string = "";
    public name: string = "";
    public hp: Decimal = new Decimal(100);
    public speed: Decimal = new Decimal(0.05);

    public scale: DecimalVec3 = new DecimalVec3(1, 2, 1);
    public position: DecimalVec3 = new DecimalVec3(0, -10, 0);
    public rotation: DecimalQuat = DecimalQuat.fromAngleZ(new DecimalQuat(), 0);

    constructor(param: SpacecraftDataParam) {
        this.id = param.id;
        this.name = param.name;
        if (param.hp) {
            this.hp = param.hp instanceof Decimal ? param.hp : new Decimal(param.hp);
        }
        if (param.speed) {
            this.speed = param.speed instanceof Decimal ? param.speed : new Decimal(param.speed);
        }
        if (param.scale) {
            this.scale.set(param.scale);
        }
        if (param.position) {
            this.position.set(param.position);
        }
        if (param.rotation) {
            this.rotation.set(param.rotation);
        }
    }
}

export interface SpacecraftDataParam {
    id: string,
    name: string,
    hp?: Decimal | number,
    speed?: Decimal | number,
    scale?: DecimalVec3 | Vec3,
    position?: DecimalVec3 | Vec3,
    rotation?: DecimalQuat | Quat,
}
