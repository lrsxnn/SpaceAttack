import { FrameMessage } from './../Notification/NotificationMessage';
import { NotificationCenter } from './../Notification/NotificationCenter';
import adapter from '../Plugin/cloudbaseAdapter';
import cloudbase from '../Plugin/cloudbase.js'
import { _decorator, log, error } from 'cc';
import NetWaitUtil from '../Tools/NetWaitUtil';
import { SpaceAttack } from '../Tools/Tools';
import { NotificationMessage } from '../Notification/NotificationMessage';
import Decimal from '../Plugin/decimal.js';
const { ccclass } = _decorator;

@ccclass('RoomManager')
export class RoomManager {
    private static _app: cloudbase.app.App = null!;
    private static _auth: cloudbase.auth.App = null!;
    private static _room: MGOBE.Room = null!;
    public static get room() {
        return this._room;
    }

    public static clear() {
        if (MGOBE.Player.id !== null) {
            MGOBE.Listener.clear();
        }
    }

    public static createRoom(playerName: string, roomName: string, createCallBack: Function) {
        let playerData: MGOBE.types.PlayerInfoPara = {
            name: playerName,
            customPlayerStatus: 1,
            customProfile: ''
        }

        let createRoomData: MGOBE.types.CreateRoomPara = {
            roomName: roomName,
            roomType: "1v1",
            maxPlayers: 2,
            isPrivate: true,
            customProperties: '',
            playerInfo: playerData
        }

        NetWaitUtil.netWaitStart('创建房间......', 'createRoom');
        this._room.createRoom(createRoomData, event => {
            NetWaitUtil.netWaitEnd('createRoom');
            if (event.code === 0) {
                log('创建房间成功');
                createCallBack();
            } else {
                error(`创建房间失败 ${event.code} ${event.msg}`);
            }
        })
    }

    public static dismissRoom(dismissRoomCallBack: Function) {
        NetWaitUtil.netWaitStart('解散房间......', 'dismissRoom');
        this._room.dismissRoom({}, event => {
            NetWaitUtil.netWaitEnd('dismissRoom');
            if (event.code === 0) {
                log('解散房间成功');
                dismissRoomCallBack();
            } else {
                error(`解散房间失败 ${event.code} ${event.msg}`);
            }
        })
    }

    /**
     * 获取游戏信息
     */
    private static getGameInfo(uid: string | undefined, loginCallBack: Function) {
        if (typeof uid === 'string') {
            NetWaitUtil.show('初始化......');
            this._app.callFunction({
                name: 'sign',
                data: {
                    openId: uid,
                    gameId: SpaceAttack.ConstValue.mgobe_gameId
                }
            }).then((res) => {
                NetWaitUtil.close();
                const { sign, nonce, timestamp, code, msg } = res.result;
                if (code !== 0) {
                    error(`获取签名失败 ${code} ${msg}`);
                } else {
                    let mgobe_gameInfo: MGOBE.types.GameInfoPara = {
                        openId: uid,
                        gameId: SpaceAttack.ConstValue.mgobe_gameId,
                        createSignature: callback => {
                            return callback({ sign, nonce, timestamp });
                        },
                    }

                    NetWaitUtil.show('初始化......');
                    MGOBE.Listener.init(mgobe_gameInfo, SpaceAttack.ConstValue.mgobe_config, event => {
                        NetWaitUtil.close();
                        if (event.code === MGOBE.ErrCode.EC_OK) {
                            log(`Listener 初始化成功 id ${MGOBE.Player.id} name ${MGOBE.Player.name}`);
                            MGOBE.Listener.add(this._room);

                            loginCallBack();
                        } else {
                            error(`Listener 初始化失败 ${event.code} ${event.msg}`);
                        }
                    })
                }
            }).catch((res) => {
                NetWaitUtil.close();
                error(res);
            })
        } else {
            error('uid 不存在');
        }
    }

    public static getMyRoom(inRoomCallBack: Function, createRoomCallBack: Function) {
        NetWaitUtil.netWaitStart('获取加入房间信息......', 'getMyRoom');
        MGOBE.Room.getMyRoom(event => {
            NetWaitUtil.netWaitEnd('getMyRoom');
            if (event.code === 0) {
                this._room.initRoom(event.data?.roomInfo);
                inRoomCallBack();
                return log(`玩家已在房间内 ${event.data?.roomInfo.name}`);
            }
            if (event.code === 20011) {
                createRoomCallBack();
                return;
            }
            return error('调用失败');
        })
    }

    public static init() {
        cloudbase.useAdapters(adapter);
        this._app = cloudbase.init({
            env: 'spaceattack-server-3d18l398c3f5c'
        })
        this._auth = this._app.auth({
            persistence: "local"
        });
        this._room = new MGOBE.Room();
        this._room.onJoinRoom = event => {
            log(`新玩家加入 ${event.data.joinPlayerId}`);
            NotificationCenter.broadcastNotification(NotificationMessage.BROADCAST_ROOM_JOINROOM, event);
        };
        this._room.onLeaveRoom = event => {
            log(`玩家退出 ${event.data.leavePlayerId}`);
            NotificationCenter.broadcastNotification(NotificationMessage.BROADCAST_ROOM_LEAVEROOM, event);
        };
        this._room.onDismissRoom = event => {
            log(`房间被解散 ${event.data.roomInfo.id} ${event.data.roomInfo.name}`);
            NotificationCenter.broadcastNotification(NotificationMessage.BROADCAST_ROOM_DISMISSROOM, event);
        };
        this._room.onUpdate = event => {
            log(`房间状态更新 ${this.logRoomInfo(this._room.roomInfo)}`);
            NotificationCenter.broadcastNotification(NotificationMessage.BROADCAST_ROOM_UPDATE, event);
        };
        this._room.onStartFrameSync = event => {
            log("开始帧同步");
            NotificationCenter.broadcastNotification(NotificationMessage.BROADCAST_ROOM_STARTFRAMESYNC, event);
        };
        this._room.onRecvFrame = event => {
            log(`收到同步消息`);
            if (SpaceAttack.ConstValue.randomSeed != event.data.frame.ext.seed) {
                SpaceAttack.ConstValue.randomSeed = event.data.frame.ext.seed;
                SpaceAttack.ConstValue.randomSeedDecimal = new Decimal(event.data.frame.ext.seed);
            }
            NotificationCenter.broadcastNotification(NotificationMessage.BROADCAST_ROOM_RECVFRAME, event);
        };
        this._room.onStopFrameSync = event => {
            log("停止帧同步");
            NotificationCenter.broadcastNotification(NotificationMessage.BROADCAST_ROOM_STOPFRAMESYNC, event);
        };
    }

    public static leaveRoom(leaveRoomCallBack: Function) {
        NetWaitUtil.netWaitStart('离开房间......', 'leaveRoom');
        this._room.leaveRoom({}, event => {
            NetWaitUtil.netWaitEnd('leaveRoom');
            if (event.code === 0) {
                log('离开房间成功');
                leaveRoomCallBack();
            } else {
                error(`离开房间失败 ${event.code} ${event.msg}`);
            }
        })
    }

    public static login(loginCallBack: Function) {
        if (this._auth.hasLoginState()) {
            this.getGameInfo(this._auth.currentUser?.uid, loginCallBack);
        } else {
            NetWaitUtil.show('登录中......');
            this._auth.anonymousAuthProvider().signIn().then(() => {
                NetWaitUtil.close();
                this.getGameInfo(this._auth.currentUser?.uid, loginCallBack)
            });
        }
    }

    /**
     * 打印房间信息
     */
    private static logRoomInfo(roomInfo: MGOBE.types.RoomInfo): string {
        return `
            id: ${roomInfo.id};
            name: ${roomInfo.name};
            type: ${roomInfo.type};
            createType: ${roomInfo.createType};
            maxPlayers: ${roomInfo.maxPlayers};
            owner: ${roomInfo.owner};
            isPrivate: ${roomInfo.isPrivate};
            customProperties: ${roomInfo.customProperties};
            playerList: ${roomInfo.playerList ? roomInfo.playerList.length : 0};
            teamList: ${roomInfo.teamList ? roomInfo.teamList.length : 0};
            frameSyncState: ${roomInfo.frameSyncState};
            frameRate: ${roomInfo.frameRate};
            routeId: ${roomInfo.routeId};
            createTime: ${roomInfo.createTime};
            startGameTime: ${roomInfo.startGameTime};
            isForbidJoin: ${roomInfo.isForbidJoin};`
    }

    public static joinRoom(roomID: string, playerName: string, joinRoomCallBack: Function) {
        this._room.initRoom({ id: roomID });
        let playerData: MGOBE.types.PlayerInfoPara = {
            name: playerName,
            customPlayerStatus: 1,
            customProfile: ''
        }
        let joinRoomData: MGOBE.types.JoinRoomPara = {
            playerInfo: playerData
        }
        NetWaitUtil.netWaitStart('加入房间......', 'joinRoom');
        this._room.joinRoom(joinRoomData, event => {
            NetWaitUtil.netWaitEnd('joinRoom');
            if (event.code === 0) {
                log('加入房间成功');
                joinRoomCallBack();
            } else {
                error(`加入房间失败 ${event.code} ${event.msg}`);
            }
        })
    }

    public static sendFrame(data: RoomFrame) {
        let sendFramePara: MGOBE.types.SendFramePara = {
            data: data,
        }
        this._room.sendFrame(sendFramePara);
    }

    public static showRoomList(callBack: Function) {
        let para: MGOBE.types.GetRoomListPara = {
            pageNo: 1,
            pageSize: 10
        }
        NetWaitUtil.netWaitStart('获取房间列表......', 'getRoomList');
        MGOBE.Room.getRoomList(para, event => {
            NetWaitUtil.netWaitEnd('getRoomList');
            if (event.code === 0) {
                let data = event.data;
                if (data?.gameId === SpaceAttack.ConstValue.mgobe_gameId) {
                    callBack(data);
                } else {
                    error(`游戏ID错误${data?.gameId}`);
                }
            } else {
                error(`获取房间列表失败${event.msg}`);
            }
        })
    }

    public static startFrameSync() {
        this._room.startFrameSync({}, event => {
            if (event.code === 0) {
                log(`恢复帧同步成功`);
            } else {
                error(`恢复帧同步失败 ${event.code} ${event.msg}`);
            }
        })
    }

    public static stopFrameSync() {
        this._room.stopFrameSync({}, event => {
            if (event.code === 0) {
                log(`停止帧同步成功`);
            } else {
                error(`停止帧同步失败 ${event.code} ${event.msg}`);
            }
        })
    }
}

export class RoomFrame {
    public readonly message: FrameMessage;
    public readonly args: any;
    constructor(message: FrameMessage, args: any = {}) {
        this.message = message;
        this.args = args;
    }
}
