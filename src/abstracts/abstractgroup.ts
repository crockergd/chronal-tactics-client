import RenderContext from '../contexts/rendercontext';
import AbstractScene from './abstractscene';
import { AbstractType } from './abstracttype';
import AbstractDepth from './abstractdepth';
import AbstractSprite from './abstractsprite';
import AbstractText from './abstracttext';
import { Vector } from 'turn-based-combat-framework';

export default class AbstractGroup {
    private renderer: RenderContext;
    private _visible: boolean;
    private _position: Vector;
    private _depth: number;
    private _affixed: boolean;
    private _alpha: number;
    private _parent: AbstractGroup;

    public framework_object: Array<AbstractType>;

    public get visible(): boolean {
        return this._visible;
    }

    get position(): Vector {
        return new Vector(this.x, this.y);
    }

    get x(): number {
        const parent_adjust: number = this._parent ? this._parent.absolute_x : 0;
        return this.absolute_x - parent_adjust;
    }

    get y(): number {
        const parent_adjust: number = this._parent ? this._parent.absolute_y : 0;
        return this.absolute_y - parent_adjust;
    }

    get absolute_x(): number {
        return this._position.x;
    }

    get absolute_y(): number {
        return this._position.y;
    }

    public get depth(): number {
        return this._depth;
    }

    public get affixed(): boolean {
        return this._affixed;
    }

    public get alpha(): number {
        return this._alpha;
    }

    public get length(): number {
        return this.framework_object.length;
    }

    public get children(): Array<AbstractType> {
        return this.framework_object;
    }

    public get children_framework_objects(): Array<any> {
        return this.framework_object.map(child => (child as AbstractSprite).framework_object);
    }

    public get framework_objects(): Array<Phaser.GameObjects.GameObject> {
        return this.framework_object.map(child => (child as any).framework_object);
    }

    public get active(): boolean {
        if (this.children && this.length) return true;
        return false;
    }

    constructor(renderer: RenderContext, scene: AbstractScene, collection?: AbstractGroup) {
        this.renderer = renderer;
        this.framework_object = new Array<AbstractType>();
        this.init();

        if (collection) collection.add(this);
    }

    public init(): void {
        this._visible = true;
        this._position = new Vector(0, 0);
        this._depth = AbstractDepth.BASELINE;
        this._affixed = false;
        this._alpha = 1;
    }

    public set_position(x: number, y: number, relative: boolean = false): void {
        if (relative) {
            this._position.x += x;
            this._position.y += y;
        } else {
            this._position.x = x;
            this._position.y = y;
        }

        for (const child of this.framework_object) {
            this.set_child_position(child, this._position.x, this._position.y, relative);
        }
    }

    public set_visible(visible: boolean): void {
        this._visible = visible;
        for (const child of this.framework_object) {
            child.set_visible(visible);
        }
    }

    public set_depth(depth: number): void {
        this._depth = depth;
        for (const child of this.framework_object) {
            child.set_depth(depth);
        }
    }

    public set_alpha(alpha: number): void {
        this._alpha = alpha;
        for (const child of this.framework_object) {
            child.set_alpha(alpha);
        }
    }

    public set_parent(parent: AbstractGroup): void {
        this._parent = parent;
    }

    public affix_ui(): void {
        this._affixed = true;
        for (const child of this.framework_object) {
            child.affix_ui();
        }
    }

    public add(child: AbstractType): void {
        this.framework_object.push(child);

        if (child instanceof AbstractSprite) child.set_parent(this);
        if (child instanceof AbstractText) child.set_parent(this);
        // if (child instanceof AbstractButton) child.set_parent(this);
        if (child instanceof AbstractGroup) child.set_parent(this);

        child.set_visible(this.visible);
        this.set_child_position(child, this._position.x, this._position.y, true);
        child.set_depth(this.depth);
        child.set_alpha(this.alpha);
        if (this.affixed) child.affix_ui();
    }

    public remove(index: number): AbstractType {
        return this.framework_object.splice(index, 1)[0];
    }

    public at(index: number): AbstractType {
        return this.framework_object[index];
    }

    public clear(): void {
        if (this.framework_object) {
            for (const child of this.framework_object) {
                child.destroy();
            }
            this.framework_object = new Array<AbstractType>();
        }
    }

    public destroy(): void {
        this.clear();
        this.init();
    }

    private set_child_position(child: AbstractType, x: number, y: number, relative: boolean): void {
        if (child instanceof AbstractGroup) {
            child.set_position(x, y, relative);
        } else {
            child.set_position(x, y, true);
        }
    }
}