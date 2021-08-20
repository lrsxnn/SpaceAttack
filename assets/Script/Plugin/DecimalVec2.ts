import { DecimalVec3 } from './DecimalVec3';

import { _decorator, Vec2 } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
import Decimal from './decimal.js';

export class DecimalVec2 {
    public static readonly ZERO = new DecimalVec2(Vec2.ZERO);
    public static readonly ONE = new DecimalVec2(Vec2.ONE);
    public static readonly NEG_ONE = new DecimalVec2(Vec2.NEG_ONE);
    public static readonly UNIT_X = new DecimalVec2(Vec2.UNIT_X);
    public static readonly UNIT_Y = new DecimalVec2(Vec2.UNIT_Y);

    /**
     * @en Element-wise vector addition and save the results to out vector object
     * @zh 逐元素向量加法
     */
    public static add<Out extends DecimalVec2>(out: Out, a: DecimalVec2 | Vec2, b: DecimalVec2 | Vec2) {
        if (a instanceof Vec2) {
            a = new DecimalVec2(a);
        }
        out.x = a.x.add(b.x);
        out.y = a.y.add(b.y);
        return out;
    }

    /**
     * @en Vector scalar multiplication and save the results to out vector object
     * @zh 向量标量乘法
     */
    public static multiplyScalar<Out extends DecimalVec2, Vec2Like extends DecimalVec2>(out: Out, a: DecimalVec2 | Vec2, b: Decimal | number) {
        if (a instanceof Vec2) {
            a = new DecimalVec2(a);
        }
        out.x = a.x.mul(b);
        out.y = a.y.mul(b);
        return out;
    }

    /**
     * @en Calculates the dot product of the vector
     * @zh 向量点积（数量积）
     */
    public static dot<Out extends DecimalVec2>(a: Out, b: Out) {
        return a.x.mul(b.x).add(a.y.mul(b.y));
    }

    /**
     * @en Calculates the cross product of the vector
     * @zh 向量叉积（向量积），注意二维向量的叉积为与 Z 轴平行的三维向量
     */
    public static cross<Out extends DecimalVec2>(out: DecimalVec3, a: Out, b: Out) {
        out.x = out.y = new Decimal(0);
        out.z = a.x.mul(b.y).sub(a.y.mul(b.x));
        return out;
    }

    /**
     * @en Calculates the squared length of the vector
     * @zh 求向量长度平方
     */
    public static lengthSqr<Out extends DecimalVec2>(a: Out) {
        const x = a.x;
        const y = a.y;
        return x.mul(x).add(y.mul(y));
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

    public v: Vec2;

    constructor(x?: Decimal | DecimalVec2 | Vec2 | number, y?: Decimal | number) {
        this.v = new Vec2();

        if (x) {
            if (x instanceof DecimalVec2) {
                this.x = x.x;
                this.y = x.y;
                return;
            } else if (x instanceof Vec2) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
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
    }
    /**
     * @en Adds the current vector with another one and return this
     * @zh 向量加法。将当前向量与指定向量的相加
     * @param other specified vector
     */
    public add(other: DecimalVec2 | Vec2) {
        this.x = this.x.add(other.x);
        this.y = this.y.add(other.y);
        return this;
    }
    /**
     * @en Multiplies the current vector with a number, and returns this.
     * @zh 向量数乘。将当前向量数乘指定标量
     * @param scalar scalar number
     */
    public multiplyScalar(scalar: Decimal | number) {
        this.x = this.x.mul(scalar);
        this.y = this.y.mul(scalar);
        return this;
    }

    public set(x?: Decimal | DecimalVec2 | Vec2 | number, y?: Decimal | number) {
        if (x) {
            if (x instanceof DecimalVec2) {
                this.x = x.x;
                this.y = x.y;
                return;
            } else if (x instanceof Vec2) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
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
        return this;
    }

    /**
     * @en Calculates the dot product with another vector
     * @zh 向量点乘。
     * @param other specified vector
     * @return The result of calculates the dot product with another vector
     */
    public dot(other: DecimalVec2 | Vec2) {
        return this.x.mul(other.x).add(this.y.mul(other.y));
    }

    /**
     * @en Calculates the cross product with another vector.
     * @zh 向量叉乘。
     * @param other specified vector
     * @return `out`
     */
    public cross(other: DecimalVec2 | Vec2) {
        return this.x.mul(other.y).sub(this.y.mul(other.x));
    }

    /**
     * @en Returns the squared length of this vector.
     * @zh 计算向量长度（模）的平方。
     * @return the squared length of this vector
     */
    public lengthSqr() {
        return this.x.mul(this.x).add(this.y.mul(this.y));
    }

    /**
     * @en Calculates radian angle between two vectors
     * @zh 获取当前向量和指定向量之间的角度。
     * @param other specified vector
     * @return The angle between the current vector and the specified vector (in radians); if there are zero vectors in the current vector and the specified vector, 0 is returned.
     */
    public angle(other: DecimalVec2 | Vec2) {
        if (other instanceof Vec2) {
            other = new DecimalVec2(other);
        }
        const magSqr1 = this.lengthSqr();
        const magSqr2 = other.lengthSqr();

        if (magSqr1.isZero() || magSqr2.isZero()) {
            console.warn('Can\'t get angle between zero vector');
            return new Decimal(0.0);
        }

        const dot = this.dot(other);
        let theta = dot.div(Decimal.sqrt(magSqr1.mul(magSqr2)));
        theta = SpaceAttack.UnityMathf.clampDecimal(theta, new Decimal(-1.0), new Decimal(1.0));
        return Decimal.acos(theta);
    }

    /**
     * @en Get angle in radian between this and vector with direction.
     * @zh 获取当前向量和指定向量之间的有符号角度。<br/>
     * 有符号角度的取值范围为 (-180, 180]，当前向量可以通过逆时针旋转有符号角度与指定向量同向。<br/>
     * @param other specified vector
     * @return The signed angle between the current vector and the specified vector (in radians); if there is a zero vector in the current vector and the specified vector, 0 is returned.
     */
    public signAngle(other: DecimalVec2 | Vec2) {
        const angle = this.angle(other);
        return this.cross(other).lessThan(0) ? angle.neg() : angle;
    }

    public toVec2(): Vec2 {
        this.v.set(this.x.toNumber(), this.y.toNumber());
        return this.v;
    }

    public fromVec2(v: Vec2) {
        this.x = new Decimal(v.x);
        this.y = new Decimal(v.y);
        return this;
    }
}
