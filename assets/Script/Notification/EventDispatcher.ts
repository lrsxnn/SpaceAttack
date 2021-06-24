import { NotificationMessage } from './NotificationMessage';
import { error } from 'cc';

export class EventDispatcher {
    private observer_list: any[] = [];

    constructor() {
        this.observer_list = [];
    }

    public addObserver(target: any) {
        this.observer_list.forEach((item: any, index: number) => {
            if (item == target) {
                return true;
            }
        });

        if (target) {
            this.observer_list.push(target);
        } else {
            error(`ERR: invalid addObserver target:${target}`)
        }
    }

    public removeObserver(target: any) {
        this.observer_list.forEach((item: any, idx: number) => {
            if (item == target) {
                this.observer_list.splice(idx, 1);
            }
        });
    }

    public removeAllObserver() {
        this.observer_list = [];
    }

    public notifyEvent(event: NotificationMessage, data?: any) {
        this.observer_list.forEach((item: any, idx: number) => {
            item.onEventMessage(event, data);
        })
    }
}