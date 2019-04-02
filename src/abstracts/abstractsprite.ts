import RenderContext from '../contexts/rendercontext';
import { GameObjects } from 'phaser';
import AbstractScene from './abstractscene';
import * as Constants from '../utils/constants';
import AbstractGroup from './abstractgroup';
import { Vector } from 'turn-based-combat-framework';
import { AbstractCollectionType } from './abstractcollectiontype';

export default class AbstractSprite {
    private renderer: RenderContext;
    private parent?: AbstractGroup;
    public framework_object: GameObjects.Sprite;

    get position(): Vector {
        return new Vector(this.x, this.y);
    }

    get x(): number {
        const parent_adjust: number = this.parent ? this.parent.absolute_x : 0;
        return this.absolute_x - parent_adjust;
    }

    get y(): number {
        const parent_adjust: number = this.parent ? this.parent.absolute_y : 0;
        return this.absolute_y - parent_adjust;
    }

    get absolute_x(): number {
        return this.framework_object.x;
    }

    get absolute_y(): number {
        return this.framework_object.y;
    }

    get visible(): boolean {
        return this.framework_object.visible;
    }

    get width(): number {
        return this.framework_object.displayWidth; // / this.renderer.DPR;
    }

    get height(): number {
        return this.framework_object.displayHeight; // / this.renderer.DPR;
    }

    get key(): string {
        if (!this.framework_object) return null;
        return this.framework_object.texture.key;
    }

    constructor(renderer: RenderContext, scene: AbstractScene, x: number, y: number, key: string | any, collection?: AbstractCollectionType) {
        this.renderer = renderer;
        this.framework_object = scene.add.sprite(x, y, key);
        this.set_anchor(0, 0);

        if (collection) {
            collection.add(this);
        }
    }

    public set_position(x: number, y: number, relative: boolean = false): void {
        if (relative) {
            this.framework_object.setPosition(this.framework_object.x + x, this.framework_object.y + y);
        } else {
            this.framework_object.setPosition(x, y);
        }
    }

    public set_scale(x: number, y: number): void {
        this.framework_object.scaleX *= x;
        this.framework_object.scaleY *= y;
    }

    public set_anchor(x: number, y: number): void {
        this.framework_object.setOrigin(x, y);
    }

    public set_frame(frame: number): void {
        this.framework_object.setFrame(frame);
    }

    public set_visible(visible: boolean): void {
        if (this.framework_object.visible === visible) return;

        this.framework_object.visible = visible;
    }

    public set_alpha(alpha: number): void {
        this.framework_object.alpha = alpha;
    }

    public set_scroll(scroll_x: number, scroll_y: number): void {
        this.framework_object.setScrollFactor(scroll_x, scroll_y);
    }

    public set_depth(depth: number): void {
        if (this.framework_object.depth > depth) return;
        this.framework_object.setDepth(depth);
    }

    public set_angle(angle: number): void {
        this.framework_object.setAngle(angle);
    }

    public set_parent(parent: AbstractGroup): void {
        this.parent = parent;
    }

    public affix_ui(): void {
        if (this.renderer.ui_camera) {
            this.framework_object.cameraFilter &= ~this.renderer.ui_camera.id;
            this.renderer.camera.ignore(this.framework_object);
        } else {
            this.set_scroll(0, 0);
        }
    }

    public crop(x: number, y: number, width: number, height: number): void {
        this.framework_object.setCrop(x, y, width, height);
    }

    public flip_x(): void {
        this.framework_object.flipX = !this.framework_object.flipX;
    }

    public on(key: string, callback: Function, context?: any, ...args: Array<any>): string {
        return this.renderer.bind_event(this.framework_object, key, callback, context, ...args);
    }

    public once(key: string, callback: Function, context?: any, ...args: Array<any>): string {
        if (key === Constants.TAP_EVENT) this.framework_object.setInteractive();
        let event_key: string = key;

        if (args && args.length) {
            event_key += Constants.EVENT_RECAST;
            this.framework_object.once(key, () => {
                this.framework_object.emit(event_key, ...args);
            });
            this.framework_object.once(event_key, callback, context);
        } else {
            this.framework_object.once(event_key, callback, context);
        }

        return event_key;
    }

    public off(key?: string): void {
        if (key) {
            this.framework_object.removeAllListeners(key);
            this.framework_object.removeAllListeners(key + Constants.EVENT_RECAST);
        } else {
            this.framework_object.removeAllListeners();
        }
    }

    public play(key: string): void {
        if (!this.framework_object) return;

        this.framework_object.play(key);
    }

    public destroy(): void {
        if (this.framework_object) {
            this.framework_object.destroy();
            this.framework_object = null;
        }
    }
}