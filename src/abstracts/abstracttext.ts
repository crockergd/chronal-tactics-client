import { GameObjects, Scene } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import Vector from '../utils/vector';
import { AbstractCollectionType } from './abstractcollectiontype';
import AbstractGroup from './abstractgroup';
import MathExtensions from '../utils/mathextensions';

export default class AbstractText {
    private renderer: RenderContext;
    private parent?: AbstractGroup;
    public framework_object: GameObjects.Text;

    private _max_width;
    private _max_height;
    private _original_size;

    private readonly STYLE: any = {
        fontFamily: 'silkscreennormal, Arial',
        fill: '#fff'
    }

    get literals(): Array<GameObjects.GameObject> {
        return [this.framework_object];
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

    get font_size(): number {
        return parseInt(this.framework_object.style.fontSize) / this.renderer.base_scale_factor;
    }

    get text(): string {
        return this.framework_object.text;
    }

    set text(text: string) {
        if (this.framework_object.text === text) return;
        this.framework_object.text = text;
        this.resize();
    }

    constructor(renderer: RenderContext, scene: Scene, x: number, y: number, text: string, container?: AbstractCollectionType) {
        this.renderer = renderer;
        this.framework_object = scene.add.text(x, y, text, this.STYLE);
        this.set_font_size(16);

        if (container) {
            container.add(this);
        }
    }

    public set_font_size(font_size: number, no_resize?: boolean): void {
        const resolved_size: number = Math.round(this.renderer.literal(font_size));
        this.framework_object.setFontSize(resolved_size);

        const stroke_size: number = Math.min((resolved_size / 12), this.renderer.literal(2));
        this.set_stroke(stroke_size);

        if (!no_resize) this.resize();
    }

    public set_stroke(stroke_size: number): void {
        this.framework_object.setStroke('#000', stroke_size);
    }

    public set_word_wrap(wrap_width: number): void {
        this.framework_object.setWordWrapWidth(this.renderer.literal(wrap_width));
    }

    public set_position(x: number, y: number, relative: boolean = false, micro: boolean = false): void {
        if (micro) {
            if (relative) {
                this.framework_object.setPosition(this.framework_object.x + x, this.framework_object.y + y);
            } else {
                this.framework_object.setPosition(x, y);
            }
        } else {
            if (relative) {
                this.framework_object.setPosition(this.framework_object.x + x, this.framework_object.y + y);
            } else {
                this.framework_object.setPosition(x, y);
            }
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

    public set_italic(): void {
        this.framework_object.setFontStyle('italic');
    }

    public set_max_width(width: number): void {
        this._original_size = this.font_size;
        this._max_width = width;
        this.resize();
    }

    public set_max_height(height: number): void {
        this._max_height = height;
        this.resize();
    }

    public affix_ui(): void {
        this.set_scroll(0, 0);
    }

    private resize(): void {
        if (this._max_width) {
            this.set_font_size(this._original_size, true);

            while (this.width > this._max_width) {
                this.set_font_size(this.font_size - 1, true);
            }
        }

        if (this._max_height) {
            while (this.height > this._max_height) {
                this.framework_object.setLineSpacing(this.framework_object.lineSpacing - 1);
            }
        }
    }

    public destroy(): void {
        if (this.framework_object) {
            this.framework_object.destroy();
            this.framework_object = null;
        }
    }
}