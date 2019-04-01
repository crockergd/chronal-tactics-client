import { GameObjects, Scene } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import AbstractGroup from './abstractgroup';
import { Vector } from 'turn-based-combat-framework';

export default class AbstractText {
    private renderer: RenderContext;
    private parent?: AbstractGroup;
    public framework_object: GameObjects.Text;

    private readonly STYLE: object = {
        fontFamily: 'silkscreennormal, Arial',
        fill: '#fff'
    }

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

    get width(): number {
        return Math.abs(this.framework_object.width);
    }

    get height(): number {
        return Math.abs(this.framework_object.height);
    }

    get alpha(): number {
        return this.framework_object.alpha;
    }

    get text(): string {
        return this.framework_object.text;
    }

    set text(text: string) {
        this.framework_object.text = text;
    }

    constructor(renderer: RenderContext, scene: Scene, x: number, y: number, text: string, container?: AbstractGroup) {
        this.renderer = renderer;
        this.framework_object = scene.add.text(x, y, text, this.STYLE);
        this.set_font_size(16);
        // this.framework_object.lineSpacing = -4;

        if (this.renderer.ui_camera) this.renderer.ui_camera.ignore(this.framework_object);

        if (container) {
            container.add(this);
        }
    }

    public set_font_size(font_size: number): void {
        this.framework_object.setFontSize(this.renderer.literal(font_size));
        this.set_stroke((font_size / 3) / this.renderer.DPR);
    }

    public set_stroke(stroke_size: number): void {
        this.framework_object.setStroke('#000', stroke_size);
    }

    public set_word_wrap(wrap_width: number): void {
        this.framework_object.setWordWrapWidth(this.renderer.literal(wrap_width));
    }

    public set_position(x: number, y: number, relative: boolean = false): void {
        if (relative) {
            this.framework_object.setPosition(this.framework_object.x + x, this.framework_object.y + y);
        } else {
            this.framework_object.setPosition(x, y);
        }
    }

    public set_anchor(x: number, y: number): void {
        this.framework_object.setOrigin(x, y);
    }

    public set_scroll(scroll_x: number, scroll_y: number): void {
        this.framework_object.setScrollFactor(scroll_x, scroll_y);
    }

    public set_depth(depth: number): void {
        if (this.framework_object.depth > depth) return;
        this.framework_object.setDepth(depth);
    }

    public set_visible(visible: boolean): void {
        this.framework_object.visible = visible;
    }

    public set_alpha(alpha: number): void {
        this.framework_object.setAlpha(alpha);
    }

    public set_fill(fill: string): void {
        this.framework_object.setFill(fill);
    }

    public set_line_spacing(spacing: number): void {
        this.framework_object.setLineSpacing(this.renderer.literal(spacing));
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

    public destroy(): void {
        if (this.framework_object) {
            this.framework_object.destroy();
            this.framework_object = null;
        }
    }
}