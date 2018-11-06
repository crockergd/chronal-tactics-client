import { GameObjects, Scene } from 'phaser';
import RenderContext from '../contexts/rendercontext';

export class AbstractText {
    private renderer: RenderContext;
    public framework_object: GameObjects.Text;

    private readonly STYLE: object = {
        fontFamily: 'Arial',
        fontSize: '16px',
        fill: '#fff',
        stroke: '#000',
        strokeThickness: 2
    }

    constructor(renderer: RenderContext, scene: Scene, x: number, y: number, text: string) {
        this.renderer = renderer;
        this.framework_object = scene.add.text(x, y, text, this.STYLE);
        // this.framework_object.lineSpacing = -4;

        // if (group) {
        //     group.add(this);
        // }
    }

    get x(): number {
        return this.framework_object.x;
    }

    get y(): number {
        return this.framework_object.y;
    }

    get width(): number {
        return Math.abs(this.framework_object.width);
    }

    get height(): number {
        return Math.abs(this.framework_object.height);
    }

    public set_origin(x: number, y: number): void {
        this.framework_object.setOrigin(x, y);
    }

    get text(): string {
        return this.framework_object.text;
    }

    set text(text: string) {
        this.framework_object.text = text;
    }

    public set_font_size(font_size: number): void {
        this.framework_object.setFontSize(font_size);

        // this.framework_object.setFontSize = font_size;
        // this.framework_object.fontSize *= this.renderer.base_scale_factor;
    }

    public set_word_wrap(wrap_width: number): void {
        // this.framework_object.wordWrap = true;
        // this.framework_object.wordWrapWidth = wrap_width;
    }

    public set_position(x: number, y: number): void {
        // this.framework_object.position.set(x, y);
    }
}