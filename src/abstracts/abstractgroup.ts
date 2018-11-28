import RenderContext from '../contexts/rendercontext';
import { GameObjects } from 'phaser';
import AbstractScene from './abstractscene';
import AbstractSprite from './abstractsprite';
import AbstractText from './abstracttext';

export default class AbstractGroup {
    private renderer: RenderContext;
    public framework_object: GameObjects.Group;

    constructor(renderer: RenderContext, scene: AbstractScene) {
        this.renderer = renderer;
        this.framework_object = scene.add.group();
    }

    public add(child: AbstractSprite | AbstractText): void {
        this.framework_object.add(child.framework_object);
    }

    
    public set_depth(depth: number): void {
        for (const child of this.framework_object.getChildren()) {
            if ((child as any).setDepth) (child as any).setDepth(depth);
        }       
    }

    public destroy(): void {
        if (this.framework_object) {
            this.framework_object.destroy(true);
        }
    }
}