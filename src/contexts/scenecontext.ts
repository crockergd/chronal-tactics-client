import RenderContext from './rendercontext';
import AbstractScene from '../phaser/abstractscene';

export default class SceneContext {
    private readonly render_context: RenderContext;
    private scene: AbstractScene;

    constructor() {
        this.render_context = new RenderContext();
    }

    public get renderer(): RenderContext {
        return this.render_context;
    }

    public set_scene(scene: AbstractScene): void {
        this.scene = scene;
        this.render_context.scene = scene;
    }
}