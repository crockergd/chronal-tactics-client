import SceneContext from '../contexts/scenecontext';
import { Scene } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import ClientSettings from '../utils/clientsettings';

export default class AbstractScene extends Scene {
    public scene_context: SceneContext;
    protected socket: SocketIOClient.Socket;
    protected combat_data: any;

    public get render_context(): RenderContext {
        return this.scene_context.render_context;
    }

    public get settings(): ClientSettings {
        return this.scene_context.settings;
    }

    public get team(): number {
        return this.scene_context.settings.team;
    }

    public init(data: any) {
        if (data) {
            this.scene_context = data.scene_context;
            this.scene_context.set_scene(this);

            this.socket = data.socket;
            this.combat_data = data.combat_data;
        }
    }

    public start(key: string, data?: any): void {
        this.scene.start(key, data);
    }
}