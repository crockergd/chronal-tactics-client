import { GameObjects, Scene } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import TextAlignmentType from '../ui/textalignmenttype';
import TextType from '../ui/texttype';
import AbstractBaseType from './abstractbasetype';
import { AbstractCollectionType } from './abstractcollectiontype';

export default class AbstractText extends AbstractBaseType {
    public framework_object: GameObjects.BitmapText;

    private _max_width;
    private _max_height;
    private _original_size;

    get width(): number {
        return Math.abs(this.framework_object.width);
    }

    get height(): number {
        let height: number = this.framework_object.height;
        if (!height) {
            this.text = '0';
            height = this.framework_object.height;
            this.text = '';
        }
        return Math.abs(height);
    }

    get font_size(): number {
        return this.framework_object.fontSize;
        // return parseInt(this.framework_object.style.fontSize) / this.renderer.base_scale_factor;
    }

    get text(): string {
        return this.framework_object.text;
    }

    set text(text: string) {
        if (this.framework_object.text === text) return;
        this.framework_object.text = text;
        this.resize();
    }

    constructor(renderer: RenderContext, scene: Scene, x: number, y: number, text: string, container?: AbstractCollectionType, alt?: TextType) {
        super(renderer, x, y);

        let font_key: string = 'silkscreen';
        const framework_object: GameObjects.BitmapText = scene.add.bitmapText(x, y, font_key, text);
        this.set_framework_object(framework_object);

        this.set_font_type(TextType.DEFAULT);

        // if (alt) {
        //     this.set_font_type(alt);
        // }

        if (container) {
            container.add(this);
        } else {
            this.update_position();
        }
    }

    public set_font_type(type: TextType): void {
        let letter_spacing: number = 0;
        let font_key: string = 'silkscreen';

        switch (type) {
            case TextType.DEFAULT:
                font_key = 'silkscreen';
                letter_spacing = -1;
                break;
            case TextType.DEFAULT_LG:
                font_key = 'silkscreen_lg';
                letter_spacing = -2;
                break;
            case TextType.DEFAULT_SM:
                font_key = 'silkscreen_sm';
                break;
        }

        this.framework_object.setLetterSpacing(letter_spacing);
        this.framework_object.setFont(font_key);
        this.framework_object.setFontSize(this.framework_object.fontData.size);
    }

    public set_scale(x: number, y: number): void {
        this.framework_object.setScale(x, y);
    }

    public set_font_size(font_size: number, alt?: boolean, no_resize?: boolean): void {
        const resolved_size: number = (this.renderer.literal(font_size));

        // this.framework_object.setFontSize(font_size);

        // this.framework_object.setFontSize(resolved_size);
        // if (font_size <= 8) {
        //     this.framework_object.setStroke(Constants.BLACK_FILL, this.renderer.literal(1));
        // }
        const stroke_size: number = Math.min((resolved_size / 12), this.renderer.literal(2));
        this.set_stroke(this.renderer.literal(stroke_size));

        // if (!alt) 
        // this.framework_object.setShadow(stroke_size, stroke_size, '#121225', undefined, true);
        // this.framework_object.setStroke(Constants.BLACK_FILL, stroke_size);
        // this.framework_object.setPadding(0, 0, 0, this.renderer.literal(font_size / 8));

        if (!no_resize) this.resize();
    }

    public set_stroke(stroke_size: number): void {
        /// this.framework_object.setDropShadow(0, 1);


        // this.framework_object.setShadow();
        // this.framework_object.setStroke(Constants.BLACK_FILL, stroke_size);
    }

    public set_word_wrap(wrap_width: number, literal: boolean = true): void {
        if (literal) wrap_width = this.renderer.literal(wrap_width);
        // this.framework_object.setWordWrapWidth(wrap_width);
        this.framework_object.maxWidth = wrap_width;
    }

    public set_line_spacing(spacing: number): void {
        // this.framework_object.setLineSpacing(this.renderer.literal(spacing));
    }

    public set_italic(): void {
        // this.framework_object.setFontStyle('italic');
    }

    public set_align(alignment: TextAlignmentType): void {
        this.framework_object.align = alignment;
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

    public pad(): void {
        // this.framework_object.setPadding(0, 0, 0, this.renderer.literal(2));
    }

    private resize(): void {
        return;

        if (this._max_width) {
            this.set_font_size(this._original_size, null, true);

            // while (this.width > this._max_width) {
            //     this.set_font_size(this.font_size - 1, null, true);
            // }
        }

        // if (this._max_height) {
        //     while (this.height > this._max_height) {
        //         // this.framework_object.setLineSpacing(this.framework_object.lineSpacing - 1);
        //         // this.set_font_size(this.font_size - 1);
        //     }
        // }
    }
}