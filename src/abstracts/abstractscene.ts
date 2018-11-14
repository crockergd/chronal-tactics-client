import SceneContext from '../contexts/scenecontext';
import { Scene } from 'phaser';

export default class AbstractScene extends Scene {
    protected scene_context: SceneContext;
    protected socket: SocketIOClient.Socket;
    protected combat_data: any;

    public init(data: any) {
        this.scene_context = data.scene_context;
        this.scene_context.set_scene(this);

        this.socket = data.socket;
        this.combat_data = data.combat_data;
    }
}