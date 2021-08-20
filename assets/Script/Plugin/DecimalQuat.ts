import Decimal from './decimal.js';

import { _decorator, Quat } from 'cc';

export class DecimalQuat {
    /**
     * @en Calculates the quaternion with given 2D angle (0, 0, z).
     * @zh 根据 2D 角度（0, 0, z）计算四元数
     *
     * @param out Output quaternion
     * @param z Angle to rotate around Z axis in degrees.
     */
    public static fromAngleZ<Out extends DecimalQuat>(out: Out, z: Decimal | number) {
        if (typeof z === "number") {
            z = new Decimal(z);
        }
        z = z.mul(new Decimal(0.5).mul(Math.PI).div(180.0));
        out.x = new Decimal(0);
        out.y = new Decimal(0);
        out.z = Decimal.sin(z);
        out.w = Decimal.cos(z);
        return out;
    }

    /**
     * @en x component.
     * @zh x 分量。
     */
    public x: Decimal;

    /**
     * @en y component.
     * @zh y 分量。
     */
    public y: Decimal;

    /**
     * @en z component.
     * @zh z 分量。
     */
    public z: Decimal;

    /**
     * @en w component.
     * @zh w 分量。
     */
    public w: Decimal;

    public q: Quat;

    constructor(x?: Decimal | Quat | DecimalQuat | number, y?: Decimal | number, z?: Decimal | number, w?: Decimal | number) {
        this.q = new Quat();

        if (x) {
            if (x instanceof DecimalQuat) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
                this.w = x.w;
                return;
            } else if (x instanceof Quat) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
                this.z = new Decimal(x.z);
                this.w = new Decimal(x.w);
                return;
            } else {
                this.x = x instanceof Decimal ? x : new Decimal(x);
            }
        } else {
            this.x = new Decimal(0);
        }

        if (y) {
            this.y = y instanceof Decimal ? y : new Decimal(y);
        } else {
            this.y = new Decimal(0);
        }

        if (z) {
            this.z = z instanceof Decimal ? z : new Decimal(z);
        } else {
            this.z = new Decimal(0);
        }

        if (w !== undefined && w !== null) {
            this.w = w instanceof Decimal ? w : new Decimal(w);
        } else {
            this.w = new Decimal(1);
        }
    }

    public set(x?: Decimal | Quat | DecimalQuat | number, y?: Decimal | number, z?: Decimal | number, w?: Decimal | number) {
        if (x) {
            if (x instanceof DecimalQuat) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
                this.w = x.w;
                return;
            } else if (x instanceof Quat) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
                this.z = new Decimal(x.z);
                this.w = new Decimal(x.w);
                return;
            } else {
                this.x = x instanceof Decimal ? x : new Decimal(x);
            }
        } else {
            this.x = new Decimal(0);
        }

        if (y) {
            this.y = y instanceof Decimal ? y : new Decimal(y);
        } else {
            this.y = new Decimal(0);
        }

        if (z) {
            this.z = z instanceof Decimal ? z : new Decimal(z);
        } else {
            this.z = new Decimal(0);
        }

        if (w !== undefined && w !== null) {
            this.w = w instanceof Decimal ? w : new Decimal(w);
        } else {
            this.w = new Decimal(1);
        }

        return this;
    }

    public toQuat(): Quat {
        this.q.set(this.x.toNumber(), this.y.toNumber(), this.z.toNumber(), this.w.toNumber());
        return this.q;
    }

    public fromQuat(q: Quat) {
        this.x = new Decimal(q.x);
        this.y = new Decimal(q.y);
        this.z = new Decimal(q.z);
        this.w = new Decimal(q.w);
        return this;
    }
}


