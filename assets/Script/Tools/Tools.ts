import { DecimalRect } from './../Plugin/DecimalRect';
import { DecimalVec2 } from './../Plugin/DecimalVec2';
import { NotificationCenter } from './../Notification/NotificationCenter';

import { Vec2, _decorator, Rect, Vec3, error, sys, Node, UITransform, log, Size } from 'cc';
import Decimal from '../Plugin/decimal.js';

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
        public static moveTowardsDecimal(current: Decimal | number, target: Decimal | number, maxDelta: Decimal | number): Decimal {
            if (typeof current === "number") {
                current = new Decimal(current);
            }
            if (typeof target === "number") {
                target = new Decimal(target);
            }
            if (typeof maxDelta === "number") {
                maxDelta = new Decimal(maxDelta);
            }
            if (Decimal.abs(target.sub(current)).lessThanOrEqualTo(maxDelta)) {
                return target;
            }
            return current.add(Decimal.sign(target.sub(current)).mul(maxDelta));
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
            if (min > max) {
                const temp = min;
                min = max;
                max = temp;
            }
            if (value < min) {
                value = min;
            } else if (value > max) {
                value = max;
            }
            return value;
        }
        public static clampDecimal(value: Decimal | number, min: Decimal | number, max: Decimal | number): Decimal {
            if (typeof value === "number") {
                value = new Decimal(value);
            }
            if (typeof min === "number") {
                min = new Decimal(min);
            }
            if (typeof max === "number") {
                max = new Decimal(max);
            }
            if (min.greaterThan(max)) {
                const temp = min;
                min = max;
                max = temp;
            }
            if (value.lessThan(min)) {
                value = min;
            } else if (value.greaterThan(max)) {
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

        public static getRandom() {
            return Math.random();
        }

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomIntArbitrary(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(this.getRandom() * (max - min)) + min;
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomIntInclusive(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(this.getRandom() * (max - min + 1)) + min;
        };

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomArbitrary(min: number, max: number): number {
            return this.getRandom() * (max - min) + min;
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomInclusive(min: number, max: number): number {
            return this.getRandom() * (max - min + 1) + min;
        };

        public static getSeedRandom() {
            SpaceAttack.ConstValue.randomSeed = (SpaceAttack.ConstValue.randomSeed * 9301 + 49297) % 233280;
            var rnd = SpaceAttack.ConstValue.randomSeed / 233280.0;
            return rnd;
        }

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomIntArbitrary(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(this.getSeedRandom() * (max - min)) + min;
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomIntInclusive(min: number, max: number): number {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(this.getSeedRandom() * (max - min + 1)) + min;
        };

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomArbitrary(min: number, max: number): number {
            return this.getSeedRandom() * (max - min) + min;
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomInclusive(min: number, max: number): number {
            return this.getSeedRandom() * (max - min + 1) + min;
        };

        public static getRandomDecimal() {
            return Decimal.random();
        }

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomIntArbitraryDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            min = Decimal.ceil(min);
            max = Decimal.floor(max);
            return Decimal.floor(this.getRandomDecimal().mul(max.sub(min))).add(min);
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomIntInclusiveDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            min = Decimal.ceil(min);
            max = Decimal.floor(max);
            return Decimal.floor(this.getRandomDecimal().mul(max.sub(min).add(1))).add(min);
        };

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomArbitraryDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            return this.getRandomDecimal().mul(max.sub(min)).add(min);
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getRandomInclusiveDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            return this.getRandomDecimal().mul(max.sub(min).add(1)).add(min);
        };

        public static getSeedRandomDecimal() {
            SpaceAttack.ConstValue.randomSeedDecimal = (SpaceAttack.ConstValue.randomSeedDecimal.mul(9301).add(49297)).mod(233280);
            var rnd = SpaceAttack.ConstValue.randomSeedDecimal.div(233280.0);
            return rnd;
        }


        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomIntArbitraryDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            min = Decimal.ceil(min);
            max = Decimal.floor(max);
            return Decimal.floor(this.getSeedRandomDecimal().mul(max.sub(min))).add(min);
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomIntInclusiveDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            min = Decimal.ceil(min);
            max = Decimal.floor(max);
            return Decimal.floor(this.getSeedRandomDecimal().mul(max.sub(min).add(1))).add(min);
        };

        /**
         * 不含最大值，含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomArbitraryDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            return this.getSeedRandomDecimal().mul(max.sub(min)).add(min);
        };

        /**
         * 含最大值， 含最小值
         * @param {*} min 
         * @param {*} max 
         */
        public static getSeedRandomInclusiveDecimal(min: Decimal | number, max: Decimal | number): Decimal {
            min = typeof min === "number" ? new Decimal(min) : min;
            max = typeof max === "number" ? new Decimal(max) : max;
            return this.getSeedRandomDecimal().mul(max.sub(min).add(1)).add(min);
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
        public static clampMagnitudeDecimal(vector: DecimalVec2 | Vec2, maxLength: Decimal | number): DecimalVec2 {
            if (vector instanceof Vec2) {
                vector = new DecimalVec2(vector);
            }
            if (typeof maxLength === "number") {
                maxLength = new Decimal(maxLength);
            }
            let sqrMagnitude = vector.lengthSqr();
            if (sqrMagnitude.greaterThan(maxLength.mul(maxLength))) {
                let mag = Decimal.sqrt(sqrMagnitude);
                let normalized_x = vector.x.div(mag);
                let normalized_y = vector.y.div(mag);
                return new DecimalVec2(normalized_x.mul(maxLength), normalized_y.mul(maxLength));
            }
            return vector;
        }
    }

    export class UnityVec3 {
        public static clampMagnitude(vector: Vec3, maxLength: number): Vec3 {
            let sqrmag = vector.lengthSqr();
            if (sqrmag > maxLength * maxLength) {
                let mag = Math.sqrt(sqrmag);
                let normalized_x = vector.x / mag;
                let normalized_y = vector.y / mag;
                let normalized_z = vector.z / mag;
                return new Vec3(normalized_x * maxLength, normalized_y * maxLength, normalized_z * maxLength);
            }
            return vector;
        }
    }

    export class ConstValue {
        public static readonly allowedArea = new DecimalRect(-9.5, -14, 19, 28);
        public static readonly baseSpeed = new Decimal(10);
        public static readonly mgobe_gameId: string = 'obg-7pl76q6r';
        public static readonly mgobe_config: MGOBE.types.ConfigPara = {
            url: '7pl76q6r.wxlagame.com',
            reconnectMaxTimes: 5,
            reconnectInterval: 1000,
            resendInterval: 1000,
            resendTimeout: 10000,
        };

        private static _pause: boolean = false;
        public static get pause() {
            return this._pause;
        }
        public static set pause(value) {
            this._pause = value;
            if (!value) {
                NotificationCenter.cleanPauseList();
            }
        }

        public static isSingleMode = true;

        public static randomSeed = 1;
        public static randomSeedDecimal = new Decimal(1);
    }

    export class SysTools {
        public static resizeByScreenSize(ui: UITransform, isSetLand: boolean) {
            if (sys.isNative) {
                let screen_ratio = SpaceAttack.SysTools.getScreenRatio(isSetLand);
                let screen_aspect = screen_ratio.width / screen_ratio.height;
                let ui_aspect = ui.width / ui.height;
                if (screen_aspect > ui_aspect) {
                    ui.width *= screen_aspect / ui_aspect;
                } else if (screen_aspect < ui_aspect) {
                    ui.height *= ui_aspect / screen_aspect;
                }
            }
        }

        public static getScreenRatio(isSetLand: boolean): Size {
            let string_ratio = SpaceAttack.NativeSysTools.getScreenRatio();
            let ratio = string_ratio.split(',');
            let width = 0, height = 0;
            if (isSetLand) {
                width = Math.max(Number(ratio[0]), Number(ratio[1]));
                height = Math.min(Number(ratio[0]), Number(ratio[1]));
            } else {
                width = Math.min(Number(ratio[0]), Number(ratio[1]));
                height = Math.max(Number(ratio[0]), Number(ratio[1]));
            }
            log(`屏幕分辨率=${width}:${height}`);
            return new Size(width, height);
        }
    }

    export class NativeSysTools {
        public static getScreenRatio() {
            let string_ratio = "";
            if (sys.OS_ANDROID == sys.os) {
                string_ratio = jsb.reflection.callStaticMethod("game/SystemTool", "getScreenRatio", "()Ljava/lang/String;");
            } else if (sys.OS_IOS == sys.os) {
                // string_ratio = jsb.reflection.callStaticMethod('SystemTool', 'getScreenRatio');
            } else {
                string_ratio = '2688,1242';
            }
            return string_ratio;
        }
    }
}
