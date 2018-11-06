import SceneContext from '../contexts/scenecontext';
import { Scene } from 'phaser';

export default class AbstractScene extends Scene {
    protected scene_context: SceneContext;

    public init(data: any) {
        this.scene_context = data.scene_context;
        this.scene_context.set_scene(this);
    }
}