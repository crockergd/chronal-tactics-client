import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';
import { Textures } from 'phaser';
import { Vector } from 'turn-based-combat-framework';
import AbstractGroup from '../abstracts/abstractgroup';
import * as Constants from '../utils/constants';
import MathExtensions from '../utils/mathextensions';
import AbstractButton from '../abstracts/abstractbutton';
import AbstractContainer from '../abstracts/abstractcontainer';
import { AbstractCollectionType } from '../abstracts/abstractcollectiontype';

export default class RenderContext {
    public scene: AbstractScene;
    public ui_camera: Phaser.Cameras.Scene2D.Camera;
    private notification_position: Vector;
    private notification_text: AbstractText;

    public get buffer(): number {
        return this.literal(20);
    }

    public get buffer_sm(): number {
        return this.buffer / 2;
    }

    public get frame_buffer(): number {
        return this.literal(3);
    }

    public get frame_buffer_lg(): number {
        return this.frame_buffer * 2;
    }

    public get DPR(): number {
        return window.devicePixelRatio;
    }

    public get baseline_x(): number {
        return 640;
    }

    public get baseline_y(): number {
        return 360;
    }

    public get scale_factor(): number {
        return this.base_scale_factor * this.DPR;
    }

    public get base_scale_factor(): number {
        return (Math.min((this.width / this.baseline_x), (this.height / this.baseline_y)));
    }

    public get outer_scale_factor(): number {
        return (Math.max((this.width / this.baseline_x), (this.height / this.baseline_y)));
    }

    public get inner_scale_factor(): number {
        return 1 + (this.outer_scale_factor - this.base_scale_factor);
    }

    public get width(): number {
        return this.camera.displayWidth;
    }

    public get height(): number {
        return this.camera.displayHeight;
    }

    public get center_x(): number {
        return this.camera.centerX;
    }

    public get center_y(): number {
        return this.camera.centerY;
    }

    public get origin_x(): number {
        return (this.width - this.literal(this.baseline_x)) / 2;
    }

    public get origin_y(): number {
        return (this.height - this.literal(this.baseline_y)) / 2;
    }

    public get extent_x(): number {
        return this.origin_x + this.literal(this.baseline_x);
    }

    public get extent_y(): number {
        return this.origin_y + this.literal(this.baseline_y);
    }

    public get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.scene.cameras.main;
    }

    public literal(literal: number): number {
        return literal * this.base_scale_factor;
    }

    public render_effect(effect_key: string, position: Vector, callback?: Function, context?: any): void {
        const sprite: AbstractSprite = this.add_sprite(position.x, position.y, effect_key);
        // sprite.set_anchor(0.5, 1);
        sprite.set_scale(6, 6);
        sprite.set_anchor(0.5, 0.25);
        sprite.framework_object.play('attack').on('animationcomplete', (animation: any, animation_frame: any, sprite: Phaser.GameObjects.Sprite) => {
            sprite.destroy();
            if (callback) callback.call(context);
        });
    }

    public add_group(group?: AbstractGroup): AbstractGroup {
        const group_object: AbstractGroup = new AbstractGroup(this, this.scene, group);

        return group_object;
    }

    public add_container(x?: number, y?: number): AbstractContainer {
        const container_object: AbstractContainer = new AbstractContainer(this, this.scene, x, y);

        return container_object;
    }

    public add_sprite(x: number, y: number, key: string, collection?: AbstractCollectionType, preserve?: boolean): AbstractSprite {
        const sprite_object: AbstractSprite = new AbstractSprite(this, this.scene, x, y, key, collection);
        if (!preserve) sprite_object.set_scale(this.base_scale_factor, this.base_scale_factor);

        return sprite_object;
    }

    public add_text(x: number, y: number, text: string, collection?: AbstractCollectionType): AbstractText {
        const text_object: AbstractText = new AbstractText(this, this.scene, x, y, text, collection);

        return text_object;
    }

    public add_button(x: number, y: number, key: string, text?: string, collection?: AbstractGroup): AbstractButton {
        const button_object: AbstractButton = new AbstractButton(this, this.scene, x, y, key, text, collection);

        return button_object;
    }

    public get_sprite_dimensions(key: string): Vector {
        const sprite: Textures.Frame = this.scene.textures.getFrame(key);

        return new Vector(sprite.width, sprite.height);
    }

    public set_notification_position(position: Vector): void {
        this.notification_position = new Vector(position.x, position.y);
        this.notification_text = this.add_text(this.notification_position.x, this.notification_position.y, '');
        this.notification_text.set_font_size(10);
        this.notification_text.set_anchor(0.5, 0);
        this.notification_text.set_word_wrap((this.width * 0.7) / this.base_scale_factor);
        this.notification_text.set_depth(position.z);
        this.notification_text.affix_ui();
        this.notification_text.set_visible(false);
    }

    public display_notification(notification: string): void {
        this.notification_text.text = notification;
        this.notification_text.set_visible(true);
    }

    public hide_notification(): void {
        this.notification_text.set_visible(false);
    }

    public validate_tolerance(pointer: Phaser.Input.Pointer): boolean {
        const drift_tolerance: number = this.height / 16;
        if (MathExtensions.diff(pointer.downX, pointer.upX) > drift_tolerance) return false;
        if (MathExtensions.diff(pointer.downY, pointer.upY) > drift_tolerance) return false;

        const time_tolerance: number = 1000;
        if ((pointer.upTime - pointer.downTime) > time_tolerance) return false;

        return true;
    }

    public bind_event(framework_object: Phaser.GameObjects.GameObject, key: string, callback: Function, context?: any, ...args: Array<any>): string {
        framework_object.setInteractive();
        let event_key: string = key;

        if (args && args.length) {
            event_key += Constants.EVENT_RECAST;
            framework_object.on(key, (pointer: Phaser.Input.Pointer) => {
                if (!this.validate_tolerance(pointer)) return;

                framework_object.emit(event_key, ...args);
            });
            framework_object.on(event_key, callback, context);
        } else {
            event_key += Constants.EVENT_RECAST;
            if (key === Constants.TAP_EVENT) {
                framework_object.on(key, (pointer: Phaser.Input.Pointer) => {
                    if (!this.validate_tolerance(pointer)) return;

                    framework_object.emit(event_key);
                });
                framework_object.on(event_key, callback, context);
            } else {
                framework_object.on(key, callback, context);
            }
        }

        return event_key;
    }
}