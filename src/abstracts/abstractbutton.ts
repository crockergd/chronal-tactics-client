import { GameObjects } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import AbstractGroup from './abstractgroup';
import AbstractScene from './abstractscene';
import AbstractSprite from './abstractsprite';
import AbstractText from './abstracttext';

export default class AbstractButton {
    private renderer: RenderContext;

    public sprite_object: AbstractSprite;
    public text_object: AbstractText;

    get literals(): Array<GameObjects.GameObject> {
        return this.sprite_object.literals.concat(this.text_object.literals);
    }

    public get x(): number {
        return this.sprite_object.group_x;
    }

    public get y(): number {
        return this.sprite_object.group_y;
    }

    public get absolute_x(): number {
        return this.sprite_object.absolute_x;
    }

    public get absolute_y(): number {
        return this.sprite_object.absolute_y;
    }

    public get width(): number {
        return this.sprite_object.width;
    }

    public get height(): number {
        return this.sprite_object.height;
    }

    get text(): string {
        return this.text_object.text;
    }

    set text(text: string) {
        this.text_object.text = text;
    }

    get active(): boolean {
        if (this.sprite_object.active || this.text_object.active) return true;
        return false;
    }

    constructor(renderer: RenderContext, scene: AbstractScene, x: number, y: number, key: string | any, text: string, readonly group?: AbstractGroup) {
        this.renderer = renderer;

        this.sprite_object = this.renderer.add_sprite(0, 0, key, group);
        this.sprite_object.set_anchor(0, 0);
        this.text_object = this.renderer.add_text(0, 0, text, group);
        this.text_object.set_anchor(0.5, 0.5);

        this.set_position(x, y);
    }

    public set_position(x: number, y: number, relative: boolean = false): void {
        this.sprite_object.set_position(x, y, relative);
        this.text_object.set_position(this.sprite_object.group_x, this.sprite_object.group_y);
        if (this.sprite_object.framework_object.originX === 0) this.text_object.set_position((this.sprite_object.width / 2), (this.sprite_object.height / 2), true);
    }

    public set_scale(x: number, y: number): void {
        this.sprite_object.set_scale(x, y);
    }

    // public set_anchor(x: number, y: number): void {
    //     this.sprite.set_anchor(x, y);
    //     this.text.set_anchor(x, y);
    // }

    public set_visible(visible: boolean): void {
        this.sprite_object.set_visible(visible);
        this.text_object.set_visible(visible);
    }

    public set_alpha(alpha: number): void {
        this.sprite_object.set_alpha(alpha);
        this.text_object.set_alpha(alpha);
    }

    public set_scroll(x: number, y: number): void {
        this.sprite_object.set_scroll(x, y);
        this.text_object.set_scroll(x, y);
    }

    public set_depth(depth: number): void {
        this.sprite_object.set_depth(depth);
        this.text_object.set_depth(depth);
    }

    public set_font_size(font_size: number): void {
        this.text_object.set_font_size(font_size);
    }

    public set_parent(parent: AbstractGroup): void {
        this.sprite_object.set_parent(parent);
        this.text_object.set_parent(parent);
    }

    public set_frame(frame: number): void {
        this.sprite_object.set_frame(frame);
    }

    public affix_ui(): void {
        this.sprite_object.affix_ui();
        this.text_object.affix_ui();
    }

    public on(key: string, callback: Function, context?: any, ...args: Array<any>): string {
        return this.sprite_object.on(key, callback, context, ...args);
    }

    public once(key: string, callback: Function, context?: any): void {
        this.sprite_object.once(key, callback, context);
    }

    public off(key?: string): void {
        this.sprite_object.off(key);
    }

    public destroy(): void {
        this.sprite_object.destroy();
        this.text_object.destroy();
    }
}