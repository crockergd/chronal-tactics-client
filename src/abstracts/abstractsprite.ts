import RenderContext from '../contexts/rendercontext';
import { GameObjects } from 'phaser';
import AbstractScene from './abstractscene';
import AbstractContainer from './abstractcontainer';

export default class AbstractSprite {
    private renderer: RenderContext;
    public framework_object: GameObjects.Sprite;

    constructor(renderer: RenderContext, scene: AbstractScene, x: number, y: number, key: string | any, container?: AbstractContainer) {
        this.renderer = renderer;
        this.framework_object = scene.add.sprite(x, y, key);

        if (container) {
            container.add(this);
        }
    }

    // public static create_from_mask(renderer: RenderContext, state: Phaser.State, x: number, y: number, mask_key: string, source_key: string, group?: RenderGroup): RenderSprite {
    //     const mask_sprite: Phaser.Sprite = state.make.sprite(0, 0, mask_key);
    //     mask_sprite.scale.set(renderer.scale_factor, renderer.scale_factor);

    //     const source_sprite: Phaser.Sprite = state.make.sprite(0, 0, source_key);
    //     source_sprite.scale.set(renderer.scale_factor, renderer.scale_factor);

    //     const source_bmd: Phaser.BitmapData = state.make.bitmapData(source_sprite.width, source_sprite.height);
    //     source_bmd.smoothed = false;
    //     source_bmd.alphaMask(source_sprite, mask_sprite);

    //     return new RenderSprite(renderer, state, x, y, source_bmd, group);
    // }

    get x(): number {
        return this.framework_object.x;
    }

    get y(): number {
        return this.framework_object.y;
    }

    // get width(): number {
    //     return Math.abs(this.framework_object.width) / this.renderer.DPR;
    // }

    // get height(): number {
    //     return Math.abs(this.framework_object.height) / this.renderer.DPR;
    // }

    public set_position(x: number, y: number): void {
        this.framework_object.setPosition(x, y);
    }

    public set_scale(x: number, y: number): void {
        this.framework_object.scaleX *= x;
        this.framework_object.scaleY *= y;
    }

    public set_anchor(x: number, y: number): void {
        this.framework_object.setOrigin(x, y);
    }

    // public set_frame(frame: number): void {
    //     this.framework_object.frame = frame;
    // }

    public set_visible(visible: boolean): void {
        this.framework_object.visible = visible;
    }

    public set_alpha(alpha: number): void {
        this.framework_object.alpha = alpha;
    }

    // public add_input_up(callback: Function, context: any, ...args: Array<any>): void {
    //     if (!this.framework_object.inputEnabled) this.framework_object.inputEnabled = true;

    //     this.framework_object.events.onInputUp.add(callback, context, null, ...args);
    // }

    // public add_animation(name: string, frames: Array<number>, frame_rate: number, loop: boolean): RenderAnimation {
    //     const animation: RenderAnimation = new RenderAnimation(this.framework_object.animations.add(name, frames, frame_rate, loop));

    //     return animation;
    // }

    // public play_animation(name?: string, kill?: boolean): void {
    //     if (!name) {
    //         this.framework_object.animations.stop();
    //     } else {
    //         this.framework_object.animations.play(name, null, null, kill);
    //     }
    // }

    // public crop(x: number, y: number, width: number, height: number): void {
    //     this.framework_object.crop(new Phaser.Rectangle(x, y, width * this.renderer.DPR, height * this.renderer.DPR), false);
    // }

    public destroy(): void {
        this.framework_object.destroy();
    }
}