import RenderContext from './rendercontext';
import AbstractScene from '../abstracts/abstractscene';
import ClientSettings from '../utils/clientsettings';

export default class SceneContext {
    private readonly _render_context: RenderContext;
    private scene: AbstractScene;

    private client_settings: ClientSettings;

    public get render_context(): RenderContext {
        return this._render_context;
    }

    public get settings(): ClientSettings {
        return this.client_settings;
    }

    constructor() {
        this._render_context = new RenderContext();

        this.client_settings = { };
    }

    public set_scene(scene: AbstractScene): void {
        this.scene = scene;
        this.render_context.scene = scene;
    }
}