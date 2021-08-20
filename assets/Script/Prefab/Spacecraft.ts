import { FrameMessage } from './../Notification/NotificationMessage';
import { RoomFrame } from './../Component/RoomManager';
import { SpacecraftMoveController } from './../Component/MoveController/SpacecraftMoveController';
import { SpacecraftData } from './../Data/SpacecraftData';
import { Enemy } from './Enemy';
import { Bullet } from './Bullet';
import { NotificationCenter } from './../Notification/NotificationCenter';
import { SpaceAttack } from '../Tools/Tools';

import { _decorator, Vec2, Vec3, ITriggerEvent, Node, Label, Camera } from 'cc';
import { NotificationMessage } from '../Notification/NotificationMessage';
import Decimal from '../Plugin/decimal.js';
import { FlyNode } from '../Component/FlyNode';
const { ccclass, property } = _decorator;

@ccclass('Spacecraft')
export class Spacecraft extends FlyNode {
    @property(Node)
    nameNode: Node = null!;

    protected _controller: SpacecraftMoveController = null!;
    private _camera: Camera = null!;
    private _spacecraftName: Node = null!;
    private _data: SpacecraftData = null!;
    public get data(): SpacecraftData {
        return this._data;
    }
    private _nameNodePos: Vec3 = new Vec3();

    private _isFire: boolean = false;
    private _playerInput: Vec2 = new Vec2();

    private readonly _fireStraightLineTimeStep: Decimal = new Decimal(0.05);
    private _fireStraightLineTime: Decimal = new Decimal(0.05);
    private readonly _fireTrackingTimeStep: Decimal = new Decimal(0.1);
    private _fireTrackingTime: Decimal = new Decimal(0.1);
    private readonly _fireLaserTimeStep: Decimal = new Decimal(5);
    private _fireLaserTime: Decimal = new Decimal(5);
    onLoad() {
        if (SpaceAttack.ConstValue.isSingleMode) {
            NotificationCenter.addObserver(this, this.onKeyboardMove, NotificationMessage.KEYBOARD_MOVE);
            NotificationCenter.addObserver(this, this.onJoysticMove, NotificationMessage.JOYSTICK_MOVE);
        } else {
            NotificationCenter.addObserver(this, this.onRecvFrame, NotificationMessage.BROADCAST_ROOM_RECVFRAME);
        }

        if (!SpaceAttack.ConstValue.pause) {
            this.onPauseExit();
        }
        this._controller = this.node.getComponent(SpacecraftMoveController)!;
    }

    onDestroy() {
        if (SpaceAttack.ConstValue.isSingleMode) {
            NotificationCenter.removeObserver(this, NotificationMessage.KEYBOARD_MOVE);
            NotificationCenter.removeObserver(this, NotificationMessage.JOYSTICK_MOVE);
        } else {
            NotificationCenter.removeObserver(this, NotificationMessage.BROADCAST_ROOM_RECVFRAME);
        }
        if (this._spacecraftName) {
            this._spacecraftName.destroy();
        }
    }

    onUpdate(dt: number) {
        this.updateNamePos();
    }

    onFixedUpdate() {
        this._fireStraightLineTime = this._fireStraightLineTime.add(this._fixedTimeStep);
        this._fireTrackingTime = this._fireTrackingTime.add(this._fixedTimeStep);
        this._fireLaserTime = this._fireLaserTime.add(this._fixedTimeStep);
        if (this._fireStraightLineTime.greaterThan(this._fireStraightLineTimeStep)) {
            this._fireStraightLineTime = this._fireStraightLineTime.sub(this._fireStraightLineTimeStep);
            if (this._isFire) {
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_STRAIGHTLINE, this.node.position.clone());
            }
        }
        if (this._fireTrackingTime.greaterThan(this._fireTrackingTimeStep)) {
            this._fireTrackingTime = this._fireTrackingTime.sub(this._fireTrackingTimeStep);
            if (this._isFire) {
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_TRACKING, this.node.position.clone());
            }
        }
        if (this._fireLaserTime.greaterThan(this._fireLaserTimeStep)) {
            this._fireLaserTime = this._fireLaserTime.sub(this._fireLaserTimeStep);
            if (this._isFire) {
                NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_FIRE_LASER, this.node);
            }
        }

        this._playerInput = SpaceAttack.UnityVec2.clampMagnitude(this._playerInput, 1);

        NotificationCenter.sendNotification(NotificationMessage.SPACECRAFT_MOVE, { id: this.data.id, playerInput: this._playerInput });
    }

    onJoysticMove(direction: Vec3) {
        this._playerInput.x = direction.x;
        this._playerInput.y = direction.y;
    }

    onKeyboardMove(data: { spaceDown: boolean, playerInput: Vec2 }) {
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

    protected onTriggerEnter(event: ITriggerEvent) {

    }

    protected onTriggerStay(event: ITriggerEvent) {
        let node = event.otherCollider.node;
        let bullet = node.getComponent(Bullet)
        if (bullet) {
            this.data.hp = this.data.hp.sub(bullet.damage);
        }
        let enemy = node.getComponent(Enemy)
        if (enemy) {
            this.data.hp = this.data.hp.sub(enemy.damage);
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
