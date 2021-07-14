import adapter from '../Plugin/cloudbaseAdapter';
import cloudbase from '../Plugin/cloudbase.js'
import { NotificationCenter } from './../Notification/NotificationCenter';
import { Enemy } from './../Prefab/Enemy';
import { Spacecraft } from './../Prefab/Spacecraft';
import { _decorator, Component, Node, systemEvent, SystemEventType, EventKeyboard, error, Vec3, Label, game, director, log } from 'cc';
import { NotificationMessage } from '../Notification/NotificationMessage';
import { SpaceAttack } from '../Tools/Tools';
const { ccclass, property } = _decorator;

const Listener = MGOBE.Listener;
const Room = MGOBE.Room;

@ccclass('GameScene')
export class GameScene extends Component {
    @property(Node)
    spacecraft: Node = null!;
    @property(Node)
    enemy: Node = null!;
    @property(Label)
    label: Label = null!;
    @property(Node)
    pauseButton: Node = null!;
    @property(Node)
    resumeButton: Node = null!;
    @property(Node)
    joinButton: Node = null!;
    @property(Node)
    leaveButton: Node = null!;
    @property(Node)
    startButton: Node = null!;
    @property(Node)
    loginButton: Node = null!;

    private _app: cloudbase.app.App = null!;
    private _auth: cloudbase.auth.App = null!;
    private _room: MGOBE.Room = null!;

    private _listenerInited = false;
    onLoad() {
        systemEvent.on(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.on(SystemEventType.KEY_UP, this.onKeyUp, this);

        cloudbase.useAdapters(adapter);
        this._app = cloudbase.init({
            env: 'spaceattack-server-3d18l398c3f5c'
        })
        this._auth = this._app.auth({
            persistence: "local"
        });
        this._room = new Room();
        this._room.onJoinRoom = this.onJoinRoom.bind(this);
        this._room.onLeaveRoom = this.onLeaveRoom.bind(this);
        this._room.onDismissRoom = this.onDismissRoom.bind(this);
        this._listenerInited = false;

        this.loginButton.active = true;
        this.pauseButton.active = false;
        this.resumeButton.active = false;
        this.joinButton.active = false;
        this.leaveButton.active = false;
        this.startButton.active = false;
    }

    onDestroy() {
        if (this._listenerInited) {
            Listener.clear();
        }
        systemEvent.off(SystemEventType.KEY_DOWN, this.onKeyDown, this);
        systemEvent.off(SystemEventType.KEY_UP, this.onKeyUp, this);
    }

    start() {
        // this.schedule(() => {
        //     error(Vec3.angle(this.spacecraft.position, this.enemy.position) * 180 / Math.PI);
        // }, 1);
        director.pause();
    }

    update(dt: number) {
        this.label.string = `Spacecraft HP: ${this.spacecraft.getComponent(Spacecraft)!.hp}
Enemy HP: ${this.enemy.getComponent(Enemy)!.hp}`;
    }

    onKeyDown(event: EventKeyboard) {
        switch (event.keyCode) {
            case 81://q
                break;
        }
    }

    onKeyUp(event: EventKeyboard) {

    }

    onClickLogin() {
        if (this._auth.hasLoginState()) {
            this.getGameInfo(this._auth.currentUser?.uid)
        } else {
            this._auth.anonymousAuthProvider().signIn().then(() => {
                this.getGameInfo(this._auth.currentUser?.uid)
            });
        }
    }

    onClickJoin() {
        Room.getMyRoom(event => {
            if (event.code === 0) {
                this._room.initRoom(event.data?.roomInfo);
                return log(`玩家已在房间内 ${event.data?.roomInfo.name}`);
            }
            if (event.code === 20011) {
                return;
            }
            return error(`调用失败`);
        })
    }

    onClickLeave() {

    }

    onClickPause() {
        director.pause();
        // game.pause();
    }

    onClickResume() {
        director.resume();
        // game.resume();
    }

    onClickStart() {
        director.resume();
        NotificationCenter.sendNotification(NotificationMessage.SET_PLAYER_CONTROLL, true);
    }

    onJoinRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.JoinRoomBst>) {
        log(`新玩家加入 ${event.data.joinPlayerId}`);
    }
    onLeaveRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.LeaveRoomBst>) {
        log(`玩家退出 ${event.data.leavePlayerId}`);
    }
    onDismissRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.DismissRoomBst>) {
        log(`房间被解散 ${event.data.roomInfo.id} ${event.data.roomInfo.name}`);
    }

    private getGameInfo(uid: string | undefined) {
        if (typeof uid === 'string') {
            this._app.callFunction({
                name: 'sign',
                data: {
                    openId: uid,
                    gameId: SpaceAttack.mgobe_gameId
                }
            }).then((res) => {
                const { sign, nonce, timestamp, code, msg } = res.result;
                if (code !== 0) {
                    error(`获取签名失败 ${code} ${msg}`);
                } else {
                    let mgobe_gameInfo: MGOBE.types.GameInfoPara = {
                        openId: uid,
                        gameId: SpaceAttack.mgobe_gameId,
                        createSignature: callback => {
                            return callback({ sign, nonce, timestamp });
                        },
                    }

                    Listener.init(mgobe_gameInfo, SpaceAttack.mgobe_config, event => {
                        if (event.code === MGOBE.ErrCode.EC_OK) {
                            log(`Listener 初始化成功`);
                            Listener.add(this._room);
                            this._listenerInited = true;

                            this.loginButton.active = false;
                            this.pauseButton.active = false;
                            this.resumeButton.active = false;
                            this.joinButton.active = true;
                            this.leaveButton.active = false;
                            this.startButton.active = false;
                        } else {
                            error(`Listener 初始化失败 ${event.code} ${event.msg}`);
                        }
                    })
                }
            }).catch((res) => {
                error(res);
            })
        } else {
            error(`uid 不存在`);
        }
    }

    public getNearestEnemy(): Node {
        return this.enemy;
    }
}
