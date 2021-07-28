import { Enemy } from './../Prefab/Enemy';
import { Spacecraft } from './../Prefab/Spacecraft';
import { GameScene } from './GameScene';
import { NotificationMessage } from './../Notification/NotificationMessage';
import { NotificationCenter } from './../Notification/NotificationCenter';
import adapter from '../Plugin/cloudbaseAdapter';
import cloudbase from '../Plugin/cloudbase.js'
import { _decorator, Component, Node, log, error, director, Label, EditBox, instantiate, Button, EventHandler, find } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
import NetWaitUtil from '../Tools/NetWaitUtil';
import PromptBoxUtil from '../Tools/PromptBoxUtil';
const { ccclass, property } = _decorator;

const Listener = MGOBE.Listener;
const Room = MGOBE.Room;

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
    editBox: EditBox = null!;

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
        this._listenerInited = false;

        this.showLoginPanel();
    }

    onDestroy() {
        if (this._listenerInited) {
            Listener.clear();
        }
    }

    start() {
        director.pause();
    }

    update(dt: number) {
        this.label.string = `Spacecraft HP: ${this.gameScene.spacecraft.getComponent(Spacecraft)!.hp}
Enemy HP: ${this.gameScene.enemy.getComponent(Enemy)!.hp}`;
    }

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

    onClickCreateRoom(event: Event, customEventData: string) {
        if (this.editBox.string != "") {
            let playerData: MGOBE.types.PlayerInfoPara = {
                name: 'Player1',
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
        } else {
            PromptBoxUtil.show('请输入房间名称');
        }
    }

    onClickJoinRoom(event: Event, customEventData: string) {
        let json: MGOBE.types.RoomInfo = JSON.parse(customEventData);
        this._room.initRoom({ id: json.id });
        let playerData: MGOBE.types.PlayerInfoPara = {
            name: 'Player2',
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

    onClickLeaveRoom() {
        NetWaitUtil.netWaitStart('离开房间......', 'leaveRoom');
        this._room.leaveRoom({}, event => {
            NetWaitUtil.netWaitEnd('leaveRoom');
            if (event.code === 0) {
                log('离开房间成功');
                this.showRoomPanel();
            } else {
                error(`离开房间失败 ${event.code} ${event.msg}`);
            }
        })
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
        log(`房间信息 ${this.logRoomInfo(event.data.roomInfo)}`);
    }
    onLeaveRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.LeaveRoomBst>) {
        log(`玩家退出 ${event.data.leavePlayerId}`);
        log(`房间信息 ${this.logRoomInfo(event.data.roomInfo)}`);
    }
    onDismissRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.DismissRoomBst>) {
        log(`房间被解散 ${event.data.roomInfo.id} ${event.data.roomInfo.name}`);
    }

    private getGameInfo(uid: string | undefined) {
        if (typeof uid === 'string') {
            NetWaitUtil.show('初始化......');
            this._app.callFunction({
                name: 'sign',
                data: {
                    openId: uid,
                    gameId: SpaceAttack.mgobe_gameId
                }
            }).then((res) => {
                NetWaitUtil.close();
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

                    NetWaitUtil.show('初始化......');
                    Listener.init(mgobe_gameInfo, SpaceAttack.mgobe_config, event => {
                        NetWaitUtil.close();
                        if (event.code === MGOBE.ErrCode.EC_OK) {
                            log('Listener 初始化成功');
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

    private showLoginPanel() {
        this.loginPanel.active = true;
        this.roomPanel.active = false;
        this.gamePanel.active = false;
        this.startButton.active = false;
    }

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
                this.showRoomList();
                return;
            }
            return error('调用失败');
        })
    }

    private showGamePanel() {
        this.loginPanel.active = false;
        this.roomPanel.active = false;
        this.gamePanel.active = true;
        this.startButton.active = true;
    }

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
                if (data?.gameId === SpaceAttack.mgobe_gameId) {
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
            playerList: ${roomInfo.playerList.length};
            teamList: ${roomInfo.teamList.length};
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
