import { NotificationCenter } from './../Notification/NotificationCenter';
import { RoomManager } from './../Component/RoomManager';
import { GameScene } from './GameScene';
import { _decorator, Component, Node, Label, EditBox, instantiate, Button, EventHandler, find, macro } from 'cc';
import { SpaceAttack } from '../Tools/Tools';
import PromptBoxUtil from '../Tools/PromptBoxUtil';
import { NotificationMessage } from '../Notification/NotificationMessage';
const { ccclass, property } = _decorator;

@ccclass('GameSceneUI')
export class GameSceneUI extends Component {
    @property(GameScene)
    gameScene: GameScene = null!;
    @property(Node)
    loginPanel: Node = null!;
    @property(Node)
    roomPanel: Node = null!;
    @property(Node)
    gamePanel: Node = null!;
    @property(Node)
    startButton: Node = null!;
    @property(Node)
    pauseButton: Node = null!;
    @property(Node)
    resumeButton: Node = null!;
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

    onLoad() {
        NotificationCenter.addObserver(this, this.onJoinRoom, NotificationMessage.BROADCAST_ROOM_JOINROOM);
        NotificationCenter.addObserver(this, this.onLeaveRoom, NotificationMessage.BROADCAST_ROOM_LEAVEROOM);
        NotificationCenter.addObserver(this, this.onDismissRoom, NotificationMessage.BROADCAST_ROOM_DISMISSROOM);
        NotificationCenter.addObserver(this, this.onStartFrameSync, NotificationMessage.BROADCAST_ROOM_STARTFRAMESYNC);
        NotificationCenter.addObserver(this, this.onStopFrameSync, NotificationMessage.BROADCAST_ROOM_STOPFRAMESYNC);

        RoomManager.init();
        this.showLoginPanel();
    }

    onDestroy() {
        NotificationCenter.removeObserver(this, NotificationMessage.BROADCAST_ROOM_JOINROOM);
        NotificationCenter.removeObserver(this, NotificationMessage.BROADCAST_ROOM_LEAVEROOM);
        NotificationCenter.removeObserver(this, NotificationMessage.BROADCAST_ROOM_DISMISSROOM);
        NotificationCenter.removeObserver(this, NotificationMessage.BROADCAST_ROOM_STARTFRAMESYNC);
        NotificationCenter.removeObserver(this, NotificationMessage.BROADCAST_ROOM_STOPFRAMESYNC);

        RoomManager.clear();
    }

    /**
     * 点击登录
     */
    onClickLogin() {
        RoomManager.login(this.showRoomPanel.bind(this));
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
        RoomManager.createRoom(this.nameEditBox.string, this.roomEditBox.string, this.showGamePanel.bind(this));
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
        RoomManager.joinRoom(json.id, this.nameEditBox.string, this.showGamePanel.bind(this));
    }

    /**
     * 点击离开房间
     */
    onClickLeaveRoom() {
        RoomManager.leaveRoom(() => {
            this.gameScene.cleanScene();
            this.showRoomPanel();
        })
    }

    /**
     * 点击暂停
     */
    onClickPause() {
        // SpaceAttack.ConstValue.pause = true;
        // // director.pause();
        // // game.pause();
        RoomManager.stopFrameSync();
    }

    /**
     * 点击恢复
     */
    onClickResume() {
        // SpaceAttack.ConstValue.pause = false;
        // // director.resume();
        // // game.resume();
        RoomManager.startFrameSync();
    }

    /**
     * 点击开始
     */
    onClickStart() {
        RoomManager.startFrameSync();
    }

    /**
     * 加入房间广播
     */
    private onJoinRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.JoinRoomBst>) {
        this.startButton.active = event.data.roomInfo.owner == MGOBE.Player.id && event.data.roomInfo.maxPlayers == event.data.roomInfo.playerList.length;

        for (let i = 0; i < event.data.roomInfo.playerList.length; i++) {
            let player = event.data.roomInfo.playerList[i];
            if (player.id === event.data.joinPlayerId) {
                this.gameScene.createSpacecraft(player.id, player.name);
                break;
            }
        }
    }
    /**
     * 离开房间广播
     */
    private onLeaveRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.LeaveRoomBst>) {
        this.startButton.active = false;
        this.gameScene.removeSpacecraft(event.data.leavePlayerId);
    }
    /**
     * 解散房间广播
     */
    private onDismissRoom(event: MGOBE.types.BroadcastEvent<MGOBE.types.DismissRoomBst>) {
        this.gameScene.cleanScene();
    }
    /**
     * 开启帧同步广播
     */
    private onStartFrameSync(event: MGOBE.types.BroadcastEvent<MGOBE.types.StartFrameSyncBst>) {
        this.startButton.active = false;
        this.pauseButton.active = true;
        this.resumeButton.active = false;
        SpaceAttack.ConstValue.pause = false;
        // director.resume();
    }
    /**
     * 停止帧同步广播
     */
    private onStopFrameSync(event: MGOBE.types.BroadcastEvent<MGOBE.types.StopFrameSyncBst>) {
        this.startButton.active = false;
        this.pauseButton.active = false;
        this.resumeButton.active = true;
        SpaceAttack.ConstValue.pause = true;
    }

    /**
     * 显示登陆面板
     */
    private showLoginPanel() {
        this.loginPanel.active = true;
        this.roomPanel.active = false;
        this.gamePanel.active = false;
        this.unschedule(this.showRoomList.bind(this));
    }

    /**
     * 显示房间面板
     */
    private showRoomPanel() {
        this.loginPanel.active = false;
        this.roomPanel.active = true;
        this.gamePanel.active = false;

        RoomManager.getMyRoom(this.showGamePanel.bind(this), () => {
            this.schedule(this.showRoomList.bind(this), 1, macro.REPEAT_FOREVER, 0);
        });
    }

    /**
     * 显示游戏面板
     */
    private showGamePanel() {
        this.loginPanel.active = false;
        this.roomPanel.active = false;
        this.gamePanel.active = true;
        this.startButton.active = RoomManager.room.roomInfo.owner == MGOBE.Player.id && RoomManager.room.roomInfo.maxPlayers == RoomManager.room.roomInfo.playerList.length;
        this.pauseButton.active = false;
        this.resumeButton.active = false;

        this.unschedule(this.showRoomList.bind(this));

        RoomManager.room.roomInfo.playerList.forEach(player => {
            this.gameScene.createSpacecraft(player.id, player.name);
        });
    }

    /**
     * 显示房间列表
     */
    private showRoomList() {
        RoomManager.showRoomList((data: MGOBE.types.GetRoomListRsp) => {
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
        })
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
