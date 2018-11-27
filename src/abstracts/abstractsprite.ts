import RenderContext from '../contexts/rendercontext';
import { GameObjects } from 'phaser';
import AbstractScene from './abstractscene';
import AbstractContainer from './abstractcontainer';
import AbstractGroup from './abstractgroup';

export default class AbstractSprite {
    private renderer: RenderContext;
    public framework_object: GameObjects.Sprite;

    constructor(renderer: RenderContext, scene: AbstractScene, x: number, y: number, key: string | any, container?: AbstractContainer | AbstractGroup) {
        this.renderer = renderer;
        this.framework_object = scene.add.sprite(x, y, key);

        if (this.renderer.ui_camera) this.renderer.ui_camera.ignore(this.framework_object);

        if (container) {
            container.add(this);
        }
    }

    get x(): number {
        return this.framework_object.x;
    }

    get y(): number {
        return this.framework_object.y;
    }

    get visible(): boolean {
        return this.framework_object.visible;
    }

    get width(): number {
        return this.framework_object.displayWidth;
    }

    get height(): number {
        return this.framework_object.displayHeight; // / this.renderer.DPR;
    }

    get key(): string {
        return this.framework_object.texture.key;
    }

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

    public set_frame(frame: number): void {
        this.framework_object.setFrame(frame);
    }

    public set_visible(visible: boolean): void {
        this.framework_object.visible = visible;
    }

    public set_alpha(alpha: number): void {
        this.framework_object.alpha = alpha;
    }

    public set_scroll(scroll_x: number, scroll_y: number): void {
        this.framework_object.setScrollFactor(scroll_x, scroll_y);
    }

    public set_depth(depth: number): void {
        this.framework_object.setDepth(depth);
    }

    public affix_ui(): void {
        if (this.renderer.ui_camera) {
            this.framework_object.cameraFilter &= ~this.renderer.ui_camera.id;
            this.renderer.camera.ignore(this.framework_object);
        } else {
            this.set_scroll(0, 0);
        }
    }

    public on(key: string, callback: Function, context?: any): void {
        this.framework_object.setInteractive();
        this.framework_object.on(key, callback, context);
    }

    public once(key: string, callback: Function, context?: any): void {
        this.framework_object.setInteractive();
        this.framework_object.once(key, callback, context);
    }

    public play(key: string): void {
        this.framework_object.play(key);
    }

    public destroy(): void {
        if (this.framework_object) {
            this.framework_object.destroy();
            this.framework_object = null;
        }
    }
}