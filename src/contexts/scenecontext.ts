import RenderContext from './rendercontext';
import AbstractScene from '../abstracts/abstractscene';
import ClientSettings from '../utils/clientsettings';

export default class SceneContext {
    private readonly render_context: RenderContext;
    private scene: AbstractScene;

    private client_settings: ClientSettings;

    public get renderer(): RenderContext {
        return this.render_context;
    }

    public get settings(): ClientSettings {
        return this.client_settings;
    }

    constructor() {
        this.render_context = new RenderContext();

        this.client_settings = {
            name: '',
            units: ['bandit', 'spearman', 'bandit', 'spearman']
        };
    }

    public set_scene(scene: AbstractScene): void {
        this.scene = scene;
        this.render_context.scene = scene;
    }
}