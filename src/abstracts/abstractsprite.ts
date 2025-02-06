import { GameObjects } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import AnimationConfig from '../utils/animationconfig';
import * as Constants from '../utils/constants';
import AbstractBaseType from './abstractbasetype';
import { AbstractCollectionType } from './abstractcollectiontype';
import AbstractScene from './abstractscene';

export default class AbstractSprite extends AbstractBaseType {
    public framework_object: GameObjects.Sprite;

    get width(): number {
        return this.framework_object.displayWidth; // / this.renderer.DPR;
    }

    get height(): number {
        return this.framework_object.displayHeight; // / this.renderer.DPR;
    }

    get width_half(): number {
        return this.width / 2;
    }

    get height_half(): number {
        return this.height / 2;
    }

    get key(): string {
        if (!this.framework_object) return null;
        return this.framework_object.texture.key;
    }

    get frame(): number {
        return +this.framework_object.frame.name;
    }

    get cropped(): boolean {
        return this.framework_object.isCropped;
    }

    constructor(renderer: RenderContext, scene: AbstractScene, x: number, y: number, key: string | any, collection?: AbstractCollectionType) {
        super(renderer, x, y);

        const framework_object: GameObjects.Sprite = scene.add.sprite(0, 0, key);
        this.set_framework_object(framework_object);

        this.set_anchor(0, 0);

        if (collection) {
            collection.add(this);
        } else {
            this.update_position();
        }
    }

    public set_scale(x: number, y: number, relative: boolean = true): void {
        if (relative) {
            this.framework_object.scaleX *= x;
            this.framework_object.scaleY *= y;

        } else {
            this.framework_object.scaleX = this.renderer.base_scale_factor * x;
            this.framework_object.scaleY = this.renderer.base_scale_factor * y;
        }
    }

    public set_rotation(degrees: number): void {
        const radians: number = degrees * (Math.PI / 180);
        this.framework_object.setRotation(radians);
    }

    public set_frame(frame: number): void {
        if (frame < 0) {
            frame = (this.framework_object.texture.frameTotal - 1) + frame;
        }

        this.framework_object.setFrame(frame);
    }

    public set_angle(angle: number): void {
        this.framework_object.setAngle(angle);
    }

    public flag_cachable(): void {
        this.framework_object.ignoreDestroy = true;
    }

    public crop(x?: number, y?: number, width?: number, height?: number): void {
        if (!x && !y && !width && !height) {
            this.framework_object.setCrop();
            return;
        }

        // FIREFOX can't handle crops with a value of 0, for web testing
        if (this.renderer.scene.game.device.browser.firefox) {
            if (width === 0) width = 1;
            if (height === 0) height = 1;
        }

        if (x) {
            width -= x;
        }
        this.framework_object.setCrop(x, y, width, height);
    }

    public flip_x(override?: boolean): void {
        if (override || override === false) this.framework_object.flipX = override;
        else this.framework_object.flipX = !this.framework_object.flipX;
    }

    public flip_y(): void {
        this.framework_object.flipY = !this.framework_object.flipY;
    }

    public has_event(key: string): boolean {
        if (key === Constants.TAP_EVENT) key = Constants.UP_EVENT;

        return this.framework_object.listenerCount(key) > 0;
    }

    public is_playing(key?: string): boolean {
        if (!this.framework_object) return false;
        if (!key) return this.framework_object.anims.isPlaying;
        if (!this.framework_object.anims.isPlaying) return false;
        if (!this.framework_object.anims.currentAnim) return false;

        return this.framework_object.anims.currentAnim.key === key;
    }

    public play(key: string, config?: AnimationConfig): void {
        if (!this.framework_object) return;

        const phaser_config: Phaser.Types.Animations.PlayAnimationConfig = {
            key: key,
            timeScale: config?.anim_scale ?? 1,
            startFrame: config?.start_frame ?? 0
        };

        if (config?.reverse) {
            this.framework_object.playReverse(phaser_config);
        } else {
            this.framework_object.play(phaser_config);
        }

        if (config?.on_complete) {
            this.framework_object.once(Phaser.Animations.Events.ANIMATION_COMPLETE_KEY + key, () => {
                config.on_complete.call();
            }, this);
        }
    }

    public pause(): void {
        if (!this.framework_object) return;

        this.framework_object.anims.currentAnim.pause();
    }

    public resume(): void {
        if (!this.framework_object) return;

        this.framework_object.anims.currentAnim.resume();
    }

    public stop(on?: number): void {
        if (on) {
            const current: Phaser.Animations.Animation = this.framework_object.anims.currentAnim;
            if (!current) {
                this.framework_object.stop();

            } else {
                const frame: Phaser.Animations.AnimationFrame = current.frames[on];
                this.framework_object.stopOnFrame(frame);
            }

        } else {
            this.framework_object.stop();
        }
    }
}