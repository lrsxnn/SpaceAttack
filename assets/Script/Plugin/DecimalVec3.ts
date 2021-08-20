
import { _decorator, Vec3, IVec3Like } from 'cc';
import Decimal from './decimal.js';

export class DecimalVec3 {
    public static readonly UNIT_X = new DecimalVec3(Vec3.UNIT_X);
    public static readonly NIT_Y = new DecimalVec3(Vec3.UNIT_Y);
    public static readonly UNIT_Z = new DecimalVec3(Vec3.UNIT_Z);
    public static readonly RIGHT = new DecimalVec3(Vec3.RIGHT);
    public static readonly UP = new DecimalVec3(Vec3.UP);
    public static readonly FORWARD = new DecimalVec3(Vec3.FORWARD); // we use -z for view-dir
    public static readonly ZERO = new DecimalVec3(Vec3.ZERO);
    public static readonly ONE = new DecimalVec3(Vec3.ONE);
    public static readonly NEG_ONE = new DecimalVec3(Vec3.NEG_ONE);

    /**
     * @en Element-wise vector addition and save the results to out vector object
     * @zh 逐元素向量加法
     */
    public static add<Out extends DecimalVec3>(out: Out, a: DecimalVec3 | Vec3, b: DecimalVec3 | Vec3) {
        if (a instanceof Vec3) {
            a = new DecimalVec3(a);
        }
        out.x = a.x.add(b.x);
        out.y = a.y.add(b.y);
        out.z = a.z.add(b.z);
        return out;
    }

    /**
     * @en Vector scalar multiplication and save the results to out vector object
     * @zh 向量标量乘法
     */
    public static multiplyScalar<Out extends DecimalVec3, Vec3Like extends DecimalVec3>(out: Out, a: DecimalVec3 | Vec3, b: Decimal | number) {
        if (a instanceof Vec3) {
            a = new DecimalVec3(a);
        }
        out.x = a.x.mul(b);
        out.y = a.y.mul(b);
        out.z = a.z.mul(b);
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

    public v: Vec3;

    constructor(x?: Decimal | DecimalVec3 | Vec3 | number, y?: Decimal | number, z?: Decimal | number) {
        this.v = new Vec3();

        if (x) {
            if (x instanceof DecimalVec3) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
                return;
            } else if (x instanceof Vec3) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
                this.z = new Decimal(x.z);
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
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    public add(other: DecimalVec3 | Vec3) {
        this.x = this.x.add(other.x);
        this.y = this.y.add(other.y);
        this.z = this.z.add(other.z);
        return this;
    }
    /**
     * @en clone a Vec3 value
     * @zh 克隆当前向量。
     */
    public clone() {
        return new DecimalVec3(this.x, this.y, this.z);
    }
    /**
     * @en Multiplies the current vector with a number, and returns this.
     * @zh 向量数乘。将当前向量数乘指定标量
     * @param scalar scalar number
     */
    public multiplyScalar(scalar: Decimal | number) {
        this.x = this.x.mul(scalar);
        this.y = this.y.mul(scalar);
        this.z = this.z.mul(scalar);
        return this;
    }

    public set(x?: Decimal | DecimalVec3 | Vec3 | number, y?: Decimal | number, z?: Decimal | number) {
        if (x) {
            if (x instanceof DecimalVec3) {
                this.x = x.x;
                this.y = x.y;
                this.z = x.z;
                return;
            } else if (x instanceof Vec3) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
                this.z = new Decimal(x.z);
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
        return this;
    }

    public toVec3(): Vec3 {
        this.v.set(this.x.toNumber(), this.y.toNumber(), this.z.toNumber());
        return this.v;
    }

    public fromVec3(v: Vec3) {
        this.x = new Decimal(v.x);
        this.y = new Decimal(v.y);
        this.z = new Decimal(v.z);
        return this;
    }
}
