import { FrameMessage } from './../Notification/NotificationMessage';
import { RoomFrame } from './../Component/RoomManager';
import { SpacecraftMoveController } from './../Component/SpacecraftMoveController';
import { SpacecraftData } from './../Data/SpacecraftData';
import { BaseComponent } from './../Component/BaseComponent';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Vec2, Vec3, ConeCollider, ITriggerEvent, Node, Label, Camera, log } from 'cc';
import { NotificationMessage } from '../Notification/NotificationMessage';
const { ccclass, property } = _decorator;

@ccclass('Spacecraft')
export class Spacecraft extends BaseComponent {
    @property(Node)
    nameNode: Node = null!;

    private _controller: SpacecraftMoveController = null!;
    private _camera: Camera = null!;
    private _spacecraftName: Node = null!;
    private _data: SpacecraftData = null!;
    public get data(): SpacecraftData {
        return this._data;
    }
    private _nameNodePos: Vec3 = new Vec3();

    private _isFire: boolean = false;
    private _playerInput: Vec2 = new Vec2();

    private _fireStraightLineTimeStep: number = 0.05;
    private _fireStraightLineTime: number = this._fireStraightLineTimeStep;
    private _fireTrackingTimeStep: number = 0.1;
    private _fireTrackingTime: number = this._fireTrackingTimeStep;
    private _fireLaserTimeStep: number = 2;
    private _fireLaserTime: number = this._fireLaserTimeStep;
    onLoad() {
        // NotificationCenter.addObserver(this, this.onKeyboardMove, NotificationMessage.KEYBOARD_MOVE);
        // NotificationCenter.addObserver(this, this.onJoysticMove, NotificationMessage.JOYSTICK_MOVE);
        NotificationCenter.addObserver(this, this.onRecvFrame, NotificationMessage.BROADCAST_ROOM_RECVFRAME);

        this._controller = this.node.getComponent(SpacecraftMoveController)!;
    }

    onDestroy() {
        // NotificationCenter.removeObserver(this, NotificationMessage.KEYBOARD_MOVE);
        // NotificationCenter.removeObserver(this, NotificationMessage.JOYSTICK_MOVE);
        NotificationCenter.removeObserver(this, NotificationMessage.BROADCAST_ROOM_RECVFRAME);
        if (this._spacecraftName) {
            this._spacecraftName.destroy();
        }
    }

    onUpdate(dt: number) {
        this.updateNamePos();
    }

    onFixedUpdate() {
        if (this._isFire) {
            this._fireStraightLineTime += this._fixedTimeStep;
            this._fireTrackingTime += this._fixedTimeStep;
            this._fireLaserTime += this._fixedTimeStep;
            if (this._fireStraightLineTime > this._fireStraightLineTimeStep) {
                this._fireStraightLineTime -= this._fireStraightLineTimeStep;
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_STRAIGHTLINE, this.node.position.clone());
            }
            if (this._fireTrackingTime > this._fireTrackingTimeStep) {
                this._fireTrackingTime -= this._fireTrackingTimeStep;
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_TRACKING, this.node.position.clone());
            }
            if (this._fireLaserTime > this._fireLaserTimeStep) {
                this._fireLaserTime -= this._fireLaserTimeStep;
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_LASER, this.node);
            }
        }

        this._playerInput = SpaceAttack.UnityVec2.clampMagnitude(this._playerInput, 1);

        NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_MOVE, { id: this.data.id, playerInput: this._playerInput });
    }

    onPauseEnter() {
        this.node.getComponent(ConeCollider)!.off('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(ConeCollider)!.off('onTriggerStay', this.onTriggerStay, this);
    }

    onPauseExit() {
        this.node.getComponent(ConeCollider)!.on('onTriggerEnter', this.onTriggerStay, this);
        this.node.getComponent(ConeCollider)!.on('onTriggerStay', this.onTriggerStay, this);
    }

    onJoysticMove(direction: Vec3) {
        if (SpaceAttack.ConstValue.isSingleMode && this.data.id !== MGOBE.Player.id) {
            return;
        }
        this._playerInput.x = direction.x;
        this._playerInput.y = direction.y;
    }

    onKeyboardMove(data: { spaceDown: boolean, playerInput: Vec2 }) {
        if (SpaceAttack.ConstValue.isSingleMode && this.data.id !== MGOBE.Player.id) {
            return;
        }
        this._playerInput.set(data.playerInput);
        this._isFire = data.spaceDown;
    }

    onRecvFrame(event: MGOBE.types.BroadcastEvent<MGOBE.types.RecvFrameBst>) {
        let frame = event.data.frame;
        for (let i = 0; i < frame.items.length; i++) {
            let item = frame.items[i];
            if (item.playerId === this._data.id) {
                let data = item.data as RoomFrame;
                switch (data.message) {
                    case FrameMessage.KEYBOARD_MOVE:
                        this.onKeyboardMove(data.args);
                        break;
                    case FrameMessage.JOYSTICK_MOVE:
                        this.onJoysticMove(data.args);
                        break;
                }
            }
        }
    }

    onTriggerStay(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let bullet = node.getComponent(Bullet)
        if (bullet) {
            this.data.hp -= bullet.damage;
        }
        let enemy = node.getComponent(Enemy)
        if (enemy) {
            this.data.hp -= enemy.damage;
        }
    }

    public init(data: SpacecraftData, nameNode: Node, camera: Camera) {
        this._data = data;
        this._spacecraftName = nameNode;
        this._camera = camera;
        this._controller.init();

        this._spacecraftName.getComponent(Label)!.string = this._data.name;
        this.updateNamePos();
    }

    private updateNamePos() {
        this.nameNode.getWorldPosition(this._nameNodePos);
        this._camera.convertToUINode(this._nameNodePos, this._spacecraftName!.parent!, this._nameNodePos);
        this._spacecraftName!.setPosition(this._nameNodePos);
    }
}
