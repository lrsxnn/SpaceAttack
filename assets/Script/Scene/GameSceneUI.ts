import { Enemy } from './../Prefab/Enemy';
import { Spacecraft } from './../Prefab/Spacecraft';
import { GameScene } from './GameScene';
import { NotificationMessage } from './../Notification/NotificationMessage';
import { NotificationCenter } from './../Notification/NotificationCenter';
import adapter from '../Plugin/cloudbaseAdapter';
import cloudbase from '../Plugin/cloudbase.js'
import { _decorator, Component, Node, log, error, Label, EditBox, instantiate, Button, EventHandler, find, macro } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
import NetWaitUtil from '../Tools/NetWaitUtil';
import PromptBoxUtil from '../Tools/PromptBoxUtil';
const { ccclass, property } = _decorator;

const Listener = MGOBE.Listener;
const Room = MGOBE.Room;
const Player = MGOBE.Player;

@ccclass('GameSceneUI')
export class GameSceneUI extends Component {
    @property(GameScene)
    gameScene: GameScene = null!;
    @property(Label)
    label: Label = null!;
    @property(Node)
    loginPanel: Node = null!;
    @property(Node)
    roomPanel: Node = null!;
    @property(Node)
    gamePanel: Node = null!;
    @property(Node)
    startButton: Node = null!;
    @property(Node)
    joinButton: Node = null!;

    @property(Node)
    roomListContent: Node = null!;
    @property(Node)
    roomButton: Node = null!;
    @property(EditBox)
    roomEditBox: EditBox = null!;
    @property(EditBox)
    nameEditBox: EditBox = null!;

    private _app: cloudbase.app.App = null!;
    private _auth: cloudbase.auth.App = null!;
    private _room: MGOBE.Room = null!;
    private _listenerInited = false;
    onLoad() {
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
        this._room.onUpdate = this.onUpdate.bind(this);
        this._room.onStartFrameSync = this.onStartFrameSync.bind(this);
        this._room.onRecvFrame = this.onRecvFrame.bind(this);
        this._room.onStopFrameSync = this.onStopFrameSync.bind(this);
        this._listenerInited = false;

        this.showLoginPanel();
    }

    onDestroy() {
        if (this._listenerInited) {
            Listener.clear();
        }
    }

    update(dt: number) {
        //         this.label.string = `Spacecraft HP: ${this.gameScene.spacecraft.getComponent(Spacecraft)!.hp}
        // Enemy HP: ${this.gameScene.enemy.getComponent(Enemy)!.hp}`;
    }

    /**
     * 点击登录
     */
    onClickLogin() {
        if (this._auth.hasLoginState()) {
            this.getGameInfo(this._auth.currentUser?.uid)
        } else {
            NetWaitUtil.show('登录中......');
            this._auth.anonymousAuthProvider().signIn().then(() => {
                NetWaitUtil.close();
                this.getGameInfo(this._auth.currentUser?.uid)
            });
        }
    }

    /**
     * 点击创建房间
     */
    onClickCreateRoom(event: Event, customEventData: string) {
        if (this.roomEditBox.string == "") {
            PromptBoxUtil.show('请输入房间名称');
            return;
        }
        if (this.nameEditBox.string == "") {
            PromptBoxUtil.show('请输入昵称名称');
            return;
        }
        let playerData: MGOBE.types.PlayerInfoPara = {
            name: this.nameEditBox.string,
            customPlayerStatus: 1,
            customProfile: ''
        }

        let createRoomData: MGOBE.types.CreateRoomPara = {
            roomName: this.editBox.string,
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
                this.showGamePanel();
            } else {
                error(`创建房间失败 ${event.code} ${event.msg}`);
            }
        })
    }

    /**
     * 点击加入房间
     */
    onClickJoinRoom(event: Event, customEventData: string) {
        if (this.nameEditBox.string == "") {
            PromptBoxUtil.show('请输入昵称名称');
            return;
        }
        let json: MGOBE.types.RoomInfo = JSON.parse(customEventData);
        this._room.initRoom({ id: json.id });
        let playerData: MGOBE.types.PlayerInfoPara = {
            name: this.nameEditBox.string,
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
                this.showGamePanel();
            } else {
                error(`加入房间失败 ${event.code} ${event.msg}`);
            }
        })
    }

    /**
     * 点击离开房间
     */
    onClickLeaveRoom() {
        NetWaitUtil.netWaitStart('离开房间......', 'leaveRoom');
        this._room.leaveRoom({}, event => {
            NetWaitUtil.netWaitEnd('leaveRoom');
            if (event.code === 0) {
                log('离开房间成功');
                this.gameScene.removeSpacecraft(Player.id);
                this.showRoomPanel();
            } else {
                error(`离开房间失败 ${event.code} ${event.msg}`);
            }
        })
    }

    /**
     * 点击暂停
     */
    onClickPause() {
        // SpaceAttack.ConstValue.pause = true;
        // // director.pause();
        // // game.pause();
        this._room.stopFrameSync({}, event => {
            if (event.code === 0) {
                log(`停止帧同步成功`);
            } else {
                error(`停止帧同步失败 ${event.code} ${event.msg}`);
            }
        })
    }

    /**
     * 点击恢复
     */
    onClickResume() {
        // SpaceAttack.ConstValue.pause = false;
        // // director.resume();
        // // game.resume();
        this._room.startFrameSync({}, event => {
            if (event.code === 0) {
                log(`恢复帧同步成功`);
            } else {
                error(`恢复帧同步失败 ${event.code} ${event.msg}`);
            }
        })
    }

    /**
     * 点击开始
     */
    onClickStart() {
        this._room.startFrameSync({}, event => {
            if (event.code === 0) {
                log(`开启帧同步成功`);
            } else {
                error(`开启帧同步失败 ${event.code} ${event.msg}`);
            }
        })
    }

    /**
     * 加入房间广播
     */
    onJoinRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.JoinRoomBst>) {
        log(`新玩家加入 ${event.data.joinPlayerId}`);
        this.startButton.active = this._room.roomInfo.owner == Player.id && this._room.roomInfo.maxPlayers == this._room.roomInfo.playerList.length;
        this.gameScene.createSpacecraft(event.data.joinPlayerId);
    }
    /**
     * 离开房间广播
     */
    onLeaveRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.LeaveRoomBst>) {
        log(`玩家退出 ${event.data.leavePlayerId}`);
        this.startButton.active = false;
        this.gameScene.removeSpacecraft(event.data.leavePlayerId);
    }
    /**
     * 解散房间广播
     */
    onDismissRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.DismissRoomBst>) {
        log(`房间被解散 ${event.data.roomInfo.id} ${event.data.roomInfo.name}`);
        this.gameScene.cleanScene();
    }
    /**
     * 房间状态广播
     */
    onUpdate(room?: MGOBE.Room | undefined) {
        log(`房间状态更新 ${this.logRoomInfo(this._room.roomInfo)}`);
    }
    /**
     * 开启帧同步广播
     */
    onStartFrameSync(event: MGOBE.types.BroadcastEvent<MGOBE.types.StartFrameSyncBst>) {
        log("开始帧同步");
        this.startButton.active = false;

        SpaceAttack.ConstValue.pause = false;
        // director.resume();
        NotificationCenter.sendNotification(NotificationMessage.SET_PLAYER_CONTROLL, true);
    }
    /**
     * 帧同步广播
     */
    onRecvFrame(event: MGOBE.types.BroadcastEvent<MGOBE.types.RecvFrameBst>) {
        // log(`收到同步消息`);
    }
    /**
     * 停止帧同步广播
     */
    onStopFrameSync(event: MGOBE.types.BroadcastEvent<MGOBE.types.StopFrameSyncBst>) {
        log("停止帧同步");
        this.startButton.active = this._room.roomInfo.owner == Player.id && this._room.roomInfo.maxPlayers == this._room.roomInfo.playerList.length;

        SpaceAttack.ConstValue.pause = true;
        NotificationCenter.sendNotification(NotificationMessage.SET_PLAYER_CONTROLL, false);
    }

    /**
     * 获取游戏信息
     */
    private getGameInfo(uid: string | undefined) {
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
                    Listener.init(mgobe_gameInfo, SpaceAttack.ConstValue.mgobe_config, event => {
                        NetWaitUtil.close();
                        if (event.code === MGOBE.ErrCode.EC_OK) {
                            log(`Listener 初始化成功 id ${Player.id} name ${Player.name}`);
                            Listener.add(this._room);
                            this._listenerInited = true;

                            this.showRoomPanel();
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

    /**
     * 显示登陆面板
     */
    private showLoginPanel() {
        this.loginPanel.active = true;
        this.roomPanel.active = false;
        this.gamePanel.active = false;
        this.startButton.active = false;
        this.unschedule(this.showRoomList.bind(this));
    }

    /**
     * 显示房间面板
     */
    private showRoomPanel() {
        this.loginPanel.active = false;
        this.roomPanel.active = true;
        this.gamePanel.active = false;
        this.startButton.active = false;

        NetWaitUtil.netWaitStart('获取加入房间信息......', 'getMyRoom');
        Room.getMyRoom(event => {
            NetWaitUtil.netWaitEnd('getMyRoom');
            if (event.code === 0) {
                this._room.initRoom(event.data?.roomInfo);
                this.showGamePanel();
                return log(`玩家已在房间内 ${event.data?.roomInfo.name}`);
            }
            if (event.code === 20011) {
                this.schedule(this.showRoomList.bind(this), 1, macro.REPEAT_FOREVER, 0);
                // this.showRoomList();
                return;
            }
            return error('调用失败');
        })
    }

    /**
     * 显示游戏面板
     */
    private showGamePanel() {
        this.loginPanel.active = false;
        this.roomPanel.active = false;
        this.gamePanel.active = true;
        this.startButton.active = false;

        this.unschedule(this.showRoomList.bind(this));

        this._room.roomInfo.playerList.forEach(player => {
            this.gameScene.createSpacecraft(player.id);
        });
    }

    /**
     * 显示房间列表
     */
    private showRoomList() {
        let para: MGOBE.types.GetRoomListPara = {
            pageNo: 1,
            pageSize: 10
        }
        NetWaitUtil.netWaitStart('获取房间列表......', 'getRoomList');
        Room.getRoomList(para, event => {
            NetWaitUtil.netWaitEnd('getRoomList');
            if (event.code === 0) {
                let data = event.data;
                if (data?.gameId === SpaceAttack.ConstValue.mgobe_gameId) {
                    let children = this.roomListContent.children;
                    children.forEach(child => {
                        child.destroy();
                    })

                    for (let i = 0; i < data.roomList.length; i++) {
                        let node = instantiate(this.roomButton);
                        node.active = true;
                        this.roomListContent.addChild(node);

                        const clickEventHandler = new EventHandler();
                        clickEventHandler.target = this.node;
                        clickEventHandler.component = 'GameSceneUI';
                        clickEventHandler.handler = 'onClickJoinRoom';
                        clickEventHandler.customEventData = JSON.stringify(data.roomList[i]);

                        let button = node.getComponent(Button);
                        button?.clickEvents.push(clickEventHandler);
                        let label = find('Label', node)!.getComponent(Label)!;
                        label.string = `${data.roomList[i].name}:${data.roomList[i].id}`;
                    }

                } else {
                    error(`游戏ID错误${data?.gameId}`);
                }
            } else {
                error(`获取房间列表失败${event.msg}`);
            }
        })
    }

    /**
     * 打印房间信息
     */
    private logRoomInfo(roomInfo: MGOBE.types.RoomInfo): string {
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
