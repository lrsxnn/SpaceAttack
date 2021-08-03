import { NotificationCenter } from './../Notification/NotificationCenter';

import { Vec2, _decorator, Rect, Vec3, error, sys, Node, UITransform, log, Size } from 'cc';

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
        public static readonly allowedArea = new Rect(-9.5, -14, 19, 28);
        public static readonly baseSpeed = 10;
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

        public static isSingleMode = false;
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
