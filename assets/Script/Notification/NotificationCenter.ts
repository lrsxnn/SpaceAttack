import { SpaceAttack } from '../Tools/Tools';
import { NotificationMessage } from './NotificationMessage';

interface ObserverInfo {
    [key: string]: MessageInfo[]
}

interface OptionInfo {
    wait_end?: boolean
}

class MessageInfo {
    target: any;
    selector: Function;
    option: OptionInfo;
    constructor(target: any, selector: Function, option: OptionInfo) {
        this.target = target;
        this.selector = selector;
        this.option = option;
    }
}

class NotificationTail {
    next: NotificationTail | null;
    event: NotificationMessage;
    context: any;
    constructor(next: NotificationTail | null, event: NotificationMessage, context: any) {
        this.next = next;
        this.event = event;
        this.context = context;
    }
}

interface pauseInfo {
    funcType: string,
    event?: NotificationMessage,
    args?: any,
}

export class NotificationCenter {
    private static observers: ObserverInfo = {};
    private static is_block_notifications = false;
    private static pending_notification_head: NotificationTail | null;
    private static pending_notification_tail: NotificationTail | null;

    private static pauseNotificatonList: pauseInfo[] = [];

    private static arrayRemoveIndex(list: MessageInfo[], idx: number) {
        list.splice(idx, 1);
    }

    public static addObserver(target: any, selector: Function, event: NotificationMessage, option: OptionInfo = {}) {
        if (NotificationCenter.observers[event] == null) {
            NotificationCenter.observers[event] = [];
        }
        NotificationCenter.observers[event].push(new MessageInfo(target, selector, option));
    }

    public static removeObserver(target: any, event: NotificationMessage): boolean {
        if (NotificationCenter.observers[event] != null) {
            for (let idx = 0; idx < NotificationCenter.observers[event].length; idx++) {
                if (NotificationCenter.observers[event][idx].target == target) {
                    NotificationCenter.arrayRemoveIndex(NotificationCenter.observers[event], idx);
                    return true;
                }
            }
        }

        return false;
    }

    /**
     * 无阻塞发送消息
     * @param event
     * @param args
     */
    public static sendNotification(event: NotificationMessage, args: any = {}) {
        if (SpaceAttack.ConstValue.pause) {
            NotificationCenter.pauseNotificatonList.push({
                funcType: "send",
                event: event,
                args: args,
            });
        } else {
            if (NotificationCenter.observers[event] != null) {
                NotificationCenter.performSelector(NotificationCenter.observers[event], args);
            }
        }
    }

    /**
     * 有阻塞发送消息
     * @param event
     * @param args
     */
    public static postNotification(event: NotificationMessage, args: any = {}) {
        if (SpaceAttack.ConstValue.pause) {
            NotificationCenter.pauseNotificatonList.push({
                funcType: "post",
                event: event,
                args: args,
            });
        } else {
            if (NotificationCenter.is_block_notifications) {
                let tail = new NotificationTail(null, event, args);
                if (NotificationCenter.pending_notification_tail != null) {
                    NotificationCenter.pending_notification_tail.next = tail;
                }
                NotificationCenter.pending_notification_tail = tail;
                if (NotificationCenter.pending_notification_head == null) {
                    NotificationCenter.pending_notification_head = tail;
                }
            } else {
                NotificationCenter.sendNotification(event, args);
            }
        }
    }

    private static performSelector(observers: MessageInfo[], args: any): boolean {
        let wait_end = true;
        if (observers.length > 0) {
            for (let idx = 0; idx < observers.length; idx++) {
                observers[idx].selector.call(observers[idx].target, args);
                if (observers[idx] == null || observers[idx].option == null || !observers[idx].option.wait_end) {
                    wait_end = false;
                }
            }
        }
        return wait_end;
    }

    public static isBlockNotifications(): boolean {
        return NotificationCenter.is_block_notifications;
    }

    public static blockNotifications(): boolean {
        if (SpaceAttack.ConstValue.pause) {
            NotificationCenter.pauseNotificatonList.push({
                funcType: "blockNotifications",
            });
            return true;
        } else {
            return NotificationCenter.is_block_notifications = true;
        }
    }

    public static unBlockNotifications() {
        if (SpaceAttack.ConstValue.pause) {
            NotificationCenter.pauseNotificatonList.push({
                funcType: "unBlockNotifications",
            });
        } else {
            let trail = NotificationCenter.pending_notification_head;
            while (trail != null) {
                let event = trail.event;
                let observers = NotificationCenter.observers[event];
                if (observers != null) {
                    NotificationCenter.pending_notification_head = trail.next;
                    let unblocking_flag = NotificationCenter.performSelector(observers, trail.context);
                    if (unblocking_flag) {
                        return;
                    }
                }
                trail = NotificationCenter.pending_notification_head;
            }
            NotificationCenter.purgePendingNotifications();
        }
    }

    private static purgePendingNotifications() {
        NotificationCenter.is_block_notifications = false;
        NotificationCenter.pending_notification_head = null;
        NotificationCenter.pending_notification_tail = null;
    }

    public static cleanPauseList() {
        while (NotificationCenter.pauseNotificatonList.length > 0) {
            let pauseInfo = NotificationCenter.pauseNotificatonList.shift();
            if (pauseInfo) {
                switch (pauseInfo.funcType) {
                    case "send":
                        NotificationCenter.sendNotification(pauseInfo.event!, pauseInfo.args);
                        break;
                    case "post":
                        NotificationCenter.postNotification(pauseInfo.event!, pauseInfo.args);
                        break;
                    case "blockNotifications":
                        NotificationCenter.blockNotifications();
                        break;
                    case "unBlockNotifications":
                        NotificationCenter.unBlockNotifications();
                        break;
                }
            }
        }
    }
}
