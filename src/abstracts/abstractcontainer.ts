import RenderContext from '../contexts/rendercontext';
import { GameObjects } from 'phaser';
import AbstractScene from './abstractscene';
import AbstractSprite from './abstractsprite';
import AbstractText from './abstracttext';
import { Vector } from 'turn-based-combat-framework';

export default class AbstractContainer {
    private renderer: RenderContext;
    public framework_object: GameObjects.Container;

    constructor(renderer: RenderContext, scene: AbstractScene, x?: number, y?: number) {
        this.renderer = renderer;
        this.framework_object = scene.add.container(x, y);
    }

    get position(): Vector {
        return new Vector(this.x, this.y);
    }

    get x(): number {
        return this.framework_object.x;
    }

    get y(): number {
        return this.framework_object.y;
    }

    public set_position(x: number, y: number): void {
        this.framework_object.setPosition(x, y);
    }

    public set_depth(depth: number): void {
        this.framework_object.setDepth(depth);
    }

    public set_visible(visible: boolean): void {
        this.framework_object.setVisible(visible);
    }

    public set_alpha(alpha: number): void {
        this.framework_object.setAlpha(alpha);
    }

    public affix_ui(): void {
        this.framework_object.setScrollFactor(0, 0);
    }

    public add(child: AbstractSprite | AbstractText): void {
        this.framework_object.add(child.framework_object);
    }

    public destroy(): void {
        this.framework_object.destroy();
    }
} 