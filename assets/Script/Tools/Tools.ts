
import { Vec2, _decorator, Rect } from 'cc';

export namespace SpaceAttack {
    export class UnityMathf {
        /**
             * Unity Mathf.MoveTowards
             */
        public static moveTowards(current: number, target: number, maxDelta: number): number {
            if (Math.abs(target - current) <= maxDelta) {
                return target;
            }
            return current + Math.sign(target - current) * maxDelta;
        }
        /**
         * Unity Mathf.MoveTowardsAngle
         */
        public static moveTowardsAngle(current: number, target: number, maxDelta: number): number {
            let deltaAngle = this.deltaAngle(current, target);
            if (-maxDelta < deltaAngle && deltaAngle < maxDelta) {
                return target;
            }
            target = current + deltaAngle;
            return this.moveTowards(current, target, maxDelta);
        }
        /**
         * Unity Mathf.Clamp
         */
        public static clamp(value: number, min: number, max: number): number {
            if (value < min) {
                value = min;
            } else if (value > max) {
                value = max;
            }
            return value;
        }
        /**
         * Unity Mathf.Repeat
         */
        public static repeat(t: number, length: number): number {
            return this.clamp(t - Math.floor(t / length) * length, 0, length);
        }
        /**
         * Unity Mathf.DeltaAngle
         */
        public static deltaAngle(current: number, target: number): number {
            let delta = this.repeat((target - current), 360);
            if (delta > 180) {
                delta -= 360;
            }
            return delta;
        }
    }

    export class Utils {
        /**
         * 中文字符串长度
         * @param str
         * @returns {number}
         */
        public static getRealLen(str: string): number {
            return str.replace(/[^\x00-\xff]/g, '__').length; //这个把所有双字节的都给匹配进去了
        };

        /**
         * 中文字符分割
         * @param str
         * @param start
         * @param len
         * @returns {*}
         */
        public static subChineseStr(str: string, start: number, len: number): string {
            if (str == null || typeof (str) === "undefined") {
                return "";
            }

            if (this.getRealLen(str) <= len) {
                return str;
            }

            if (!start || start < 0) {
                start = 0;
            }
            var str_length = start;
            // var str_len = str.length;
            var str_cut = new String();

            let astralRange = /\ud83c[\udffb-\udfff](?=\ud83c[\udffb-\udfff])|(?:[^\ud800-\udfff][\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]?|[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?(?:\u200d(?:[^\ud800-\udfff]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff])[\ufe0e\ufe0f]?(?:[\u0300-\u036f\ufe20-\ufe23\u20d0-\u20f0]|\ud83c[\udffb-\udfff])?)*/g
            let _str = str.match(astralRange) || [];
            let str_len = _str.length;

            for (var i = start; i < str_len; i++) {
                // let a = str.charAt(i);
                let a = _str[i];
                str_length++;
                if (a.match(/[^\x00-\xff]/g)) {
                    //中文字符的长度经编码之后大于4
                    str_length++;
                } else {
                    str_length += (a.length - 1) >= 0 ? (a.length - 1) : 0;
                }
                str_cut = str_cut.concat(a);
                if (str_length >= len) {
                    str_cut = str_cut.concat("...");
                    return str_cut.toString();
                }
            }
            //如果给定字符串小于指定长度，则返回源字符串；
            return str;
        };

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomInt(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min;
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomIntInclusive(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min + 1)) + min;
        };

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandom(min: number, max: number): number {
            return Math.random() * (max - min) + min;
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomInclusive(min: number, max: number): number {
            return Math.random() * (max - min + 1) + min;
        };
    }

    export class UnityVec2 {
        /**
         * Unity Vector2.ClampMagnitude
         */
        public static clampMagnitude(vector: Vec2, maxLength: number): Vec2 {
            let sqrMagnitude = vector.lengthSqr();
            if (sqrMagnitude > maxLength * maxLength) {
                let mag = Math.sqrt(sqrMagnitude);
                let normalized_x = vector.x / mag;
                let normalized_y = vector.y / mag;
                return new Vec2(normalized_x * maxLength, normalized_y * maxLength);
            }
            return vector;
        }
    }

    export const allowedArea = new Rect(-9.5, -14, 19, 28);
    export const baseSpeed = 10;
}
