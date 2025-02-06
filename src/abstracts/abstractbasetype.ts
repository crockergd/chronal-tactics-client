import { GameObjects } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import CallbackBinding from '../utils/callbackbinding';
import * as Constants from '../utils/constants';
import UID from '../utils/uid';
import UIDType from '../utils/uidtype';
import Vector from '../utils/vector';
import AbstractGroup from './abstractgroup';

export type AbstractFrameworkType = GameObjects.Sprite | GameObjects.Text | GameObjects.BitmapText | GameObjects.Graphics;

export default class AbstractBaseType {
    public framework_object: AbstractFrameworkType;

    protected parent: AbstractGroup;

    protected position: Vector;
    protected _alpha: number;
    public visibility: boolean;
    public uid: string;
    protected round: boolean;

    get literals(): Array<GameObjects.GameObject> {
        return [this.framework_object];
    }

    get x(): number {
        let x: number = this.position.x;
        if (this.parent) {
            x += this.parent.x;
        }
        return x;
    }

    get y(): number {
        let y: number = this.position.y;
        if (this.parent) {
            y += this.parent.y;
        }
        return y;
    }

    get group_x(): number {
        return this.position.x;
    }

    get group_y(): number {
        return this.position.y;
    }

    get absolute_x(): number {
        return this.framework_object.x;
    }

    get absolute_y(): number {
        return this.framework_object.y;
    }

    get anchor_x(): number {
        if (this.framework_object instanceof GameObjects.Graphics) return 0;
        return this.framework_object.originX;
    }

    get anchor_y(): number {
        if (this.framework_object instanceof GameObjects.Graphics) return 0;
        return this.framework_object.originY;
    }

    get visible(): boolean {
        return (this.parent?.visible ?? true) && this.visibility;
    }

    get depth(): number {
        return this.framework_object.depth;
    }

    get alpha(): number {
        let alpha: number = this._alpha;
        if (this.parent) {
            alpha *= this.parent.alpha;
        }
        return alpha;
    }

    set alpha(value: number) {
        this.set_alpha(value);
    }

    get active(): boolean {
        if (this.framework_object) return true;
        return false;
    }

    constructor(protected readonly renderer: RenderContext, x: number, y: number) {
        this.position = new Vector(x, y);
        this.visibility = true;
        this.round = false;
        this.uid = UID.next(UIDType.GAME_OBJECT);
        this._alpha = 1;
    }

    public set_framework_object(framework_object: AbstractFrameworkType): void {
        this.framework_object = framework_object;
    }

    public set_parent(parent: AbstractGroup): void {
        this.parent = parent;
    }

    public set_alpha(value: number): void {
        this._alpha = value;

        this.update_alpha();
    }

    public update_alpha(): void {
        this.framework_object.setAlpha(this.alpha);
    }

    public offset_absolute(): void {
        if (!this.parent) return;
        this.set_position(-this.parent.group_x, -this.parent.group_y, true);
    }

    public set_position(x: number, y: number, relative: boolean = false): void {
        if (relative) {
            this.position.x += x;
            this.position.y += y;
        } else {
            this.position.x = x;
            this.position.y = y;
        }

        this.update_position();
    }

    public update_position(): void {
        if (this.round) {
            this.framework_object.setPosition(this.renderer.spatial(this.x), this.renderer.spatial(this.y));

        } else {
            this.framework_object.setPosition(this.x, this.y);
        }
    }

    public round_position(): void {
        this.round = true;
        this.update_position();
    }

    public set_anchor(x: number, y: number): void {
        if (this.framework_object instanceof GameObjects.Graphics) return;
        this.framework_object.setOrigin(x, y);
    }

    public set_depth(depth: number, force?: boolean): void {
        if (this.framework_object.depth > depth && !force) return;
        this.framework_object.setDepth(depth);
    }

    public set_visible(visible: boolean): void {
        this.visibility = visible;

        this.update_visibility();
    }

    public update_visibility(): void {
        this.framework_object.visible = this.visible;
    }

    public set_scroll(scroll_x: number, scroll_y: number): void {
        this.framework_object.setScrollFactor(scroll_x, scroll_y);
    }

    public affix_ui(): void {
        this.set_scroll(0, 0);
    }

    public attach_binding(binding: CallbackBinding, ...args: Array<any>): void {
        this.renderer.bind_event(this.framework_object, binding.key || Constants.TAP_EVENT, binding.callback, binding.context, ...args);
    }

    public on(key: string, callback: Function, context?: any, ...args: Array<any>): string {
        return this.renderer.bind_event(this.framework_object, key, callback, context, ...args);
    }

    public once(key: string, callback: Function, context?: any, ...args: Array<any>): string {
        let event_key: string;
        if (key === Constants.TAP_EVENT) {
            this.framework_object.setInteractive();
            event_key = Constants.UP_EVENT;
        } else {
            event_key = key;
        }

        if (args && args.length) {
            this.framework_object.once(event_key, () => {
                this.framework_object.emit(event_key, ...args);
            });
            event_key += Constants.EVENT_RECAST;
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

    public tap(): void {
        this.framework_object.emit('pointerup');
    }

    public nav(): void {
        this.framework_object.emit(Constants.NAV_EVENT);
    }

    public unnav(): void {
        this.framework_object.emit(Constants.UNNAV_EVENT);
    }

    public call(event: string): void {
        this.framework_object.emit(event);
    }

    public calculate_bounds(): Vector {
        const bounds: Vector = new Vector(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 0, 0);
        if (this.framework_object instanceof GameObjects.Graphics) return bounds;

        const width: number = this.framework_object.width;
        const height: number = this.framework_object.height;
        const anchor_x_adjust: number = width * this.anchor_x;
        const anchor_y_adjust: number = height * this.anchor_y;

        bounds.x = this.absolute_x;
        bounds.z = bounds.x + width;
        bounds.x -= anchor_x_adjust;
        bounds.z -= anchor_x_adjust;

        bounds.y = this.absolute_y;
        bounds.w = bounds.y + height;
        bounds.y -= anchor_y_adjust;
        bounds.w -= anchor_y_adjust;

        return bounds;
    }

    public destroy(): void {
        if (this.framework_object) {
            this.framework_object.destroy();
            this.framework_object = null;
        }
    }
}