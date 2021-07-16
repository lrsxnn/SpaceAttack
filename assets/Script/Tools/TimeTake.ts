
import { _decorator, log } from 'cc';
const { ccclass } = _decorator;

@ccclass('TimeTake')
export class TimeTake {
    private static _items: TimeTakeItem[] = [];

    public static start(tag: string) {
        let item = this.getItem(tag);
        item.setStartTime(new Date().getTime());
    }

    public static end(tag: string) {
        let item = this.getItem(tag);
        item.setEndTime(new Date().getTime());
        log(`${tag} 耗时${item.getTimeTake() / 1000.0}秒`);
    }

    private static getItem(tag: string): TimeTakeItem {
        let result: TimeTakeItem = null!;
        this._items.forEach(item => {
            if (item.tag === tag) {
                result = item;
            }
        })
        if (result === null) {
            result = this.addItem(tag);
        }

        return result;
    }

    private static addItem(tag: string): TimeTakeItem {
        let length = this._items.push(new TimeTakeItem(tag));
        return this._items[length - 1];
    }
}

class TimeTakeItem {
    public tag: string = '';
    private _startTime: number = 0;
    private _endTime: number = 0;
    constructor(tag: string) {
        this.tag = tag;
    }

    public setStartTime(time: number) {
        this._startTime = time;
    }

    public setEndTime(time: number) {
        this._endTime = time;
    }

    public getTimeTake(): number {
        return this._endTime - this._startTime;
    }
}
