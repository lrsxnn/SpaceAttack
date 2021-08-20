import { DecimalVec2 } from './DecimalVec2';
import { _decorator, Rect } from 'cc';
import Decimal from './decimal.js';

export class DecimalRect {
    /**
         * @en The minimum x value.
         * @zh 获取或设置矩形在 x 轴上的最小值。
         */
    get xMin() {
        return this.x;
    }

    set xMin(value) {
        this.width = this.width.add(this.x.sub(value));
        this.x = value;
    }

    /**
     * @en The minimum y value.
     * @zh 获取或设置矩形在 y 轴上的最小值。
     */
    get yMin() {
        return this.y;
    }

    set yMin(value) {
        this.height = this.height.add(this.y.sub(value));
        this.y = value;
    }

    /**
     * @en The maximum x value.
     * @zh 获取或设置矩形在 x 轴上的最大值。
     */
    get xMax() {
        return this.x.add(this.width);
    }

    set xMax(value) {
        this.width = value.sub(this.x);
    }

    /**
     * @en The maximum y value.
     * @zh 获取或设置矩形在 y 轴上的最大值。
     */
    get yMax() {
        return this.y.add(this.height);
    }

    set yMax(value) {
        this.height = value.sub(this.y);
    }

    /**
     * @en The position of the center of the rectangle.
     * @zh 获取或设置矩形中心点的坐标。
     */
    get center() {
        return new DecimalVec2(this.x.add(this.width.mul(0.5)),
            this.y.add(this.height.mul(0.5)));
    }

    set center(value) {
        this.x = value.x.sub(this.width.mul(0.5));
        this.y = value.y.sub(this.height.mul(0.5));
    }

    /**
     * @en Returns a new {{Vec2}} object representing the position of the rectangle
     * @zh 获取或设置矩形的 x 和 y 坐标。
     */
    get origin() {
        return new DecimalVec2(this.x, this.y);
    }

    set origin(value) {
        this.x = value.x;
        this.y = value.y;
    }

    // compatibility with vector interfaces
    set z(val) { this.width = val; }
    get z() { return this.width; }
    set w(val) { this.height = val; }
    get w() { return this.height; }

    /**
     * @en The minimum x value.
     * @zh 矩形最小点的 x 坐标。
     */
    public x: Decimal;

    /**
     * @en The minimum y value.
     * @zh 矩形最小点的 y 坐标。
     */
    public y: Decimal;

    /**
     * @en The width of the Rect.
     * @zh 矩形的宽度。
     */
    public width: Decimal;

    /**
     * @en The height of the Rect.
     * @zh 矩形的高度。
     */
    public height: Decimal;

    /**
     * @en Constructs a Rect from another one.
     * @zh 构造与指定矩形相等的矩形。
     * @param other Specified Rect.
     */
    /**
     * @en Constructs a Rect with specified values.
     * @zh 构造具有指定的最小值和尺寸的矩形。
     * @param x The minimum X coordinate of the rectangle.
     * @param y The minimum Y coordinate of the rectangle.
     * @param width The width of the rectangle, measured from the X position.
     * @param height The height of the rectangle, measured from the Y position.
     */
    constructor(x?: DecimalRect | number | Decimal | Rect, y?: Decimal | number, width?: Decimal | number, height?: Decimal | number) {
        if (x) {
            if (x instanceof DecimalRect) {
                this.x = x.x;
                this.y = x.y;
                this.width = x.width;
                this.height = x.height;
                return;
            } else if (x instanceof Rect) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
                this.width = new Decimal(x.width);
                this.height = new Decimal(x.height);
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

        if (width) {
            this.width = width instanceof Decimal ? width : new Decimal(width);
        } else {
            this.width = new Decimal(0);
        }

        if (height) {
            this.height = height instanceof Decimal ? height : new Decimal(height);
        } else {
            this.height = new Decimal(0);
        }
    }

    /**
     * @en Set values with another Rect.
     * @zh 设置当前矩形使其与指定矩形相等。
     * @param other Specified Rect.
     * @returns `this`
     */

    /**
     * @en Set the value of each component of the current Rect.
     * @zh 设置当前矩形使其与指定参数的矩形相等。
     * @param x The x parameter of the specified rectangle
     * @param y The y parameter of the specified rectangle
     * @param width The width parameter of the specified rectangle
     * @param height The height parameter of the specified rectangle
     * @returns `this`
     */
    public set(x?: DecimalRect | Rect | number | Decimal, y?: Decimal | number, width?: Decimal | number, height?: Decimal | number) {
        if (x) {
            if (x instanceof DecimalRect) {
                this.x = x.x;
                this.y = x.y;
                this.width = x.width;
                this.height = x.height;
                return;
            } else if (x instanceof Rect) {
                this.x = new Decimal(x.x);
                this.y = new Decimal(x.y);
                this.width = new Decimal(x.width);
                this.height = new Decimal(x.height);
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

        if (width) {
            this.width = width instanceof Decimal ? width : new Decimal(width);
        } else {
            this.width = new Decimal(0);
        }

        if (height) {
            this.height = height instanceof Decimal ? height : new Decimal(height);
        } else {
            this.height = new Decimal(0);
        }
        return this;
    }
}

/**
 * [1] Class member could be defined like this.
 * [2] Use `property` decorator if your want the member to be serializable.
 * [3] Your initialization goes here.
 * [4] Your update function goes here.
 *
 * Learn more about scripting: https://docs.cocos.com/creator/3.0/manual/en/scripting/
 * Learn more about CCClass: https://docs.cocos.com/creator/3.0/manual/en/scripting/ccclass.html
 * Learn more about life-cycle callbacks: https://docs.cocos.com/creator/3.0/manual/en/scripting/life-cycle-callbacks.html
 */
