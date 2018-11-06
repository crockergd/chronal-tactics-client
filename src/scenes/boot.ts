import SceneContext from '../contexts/scenecontext';
import AbstractScene from '../phaser/abstractscene';

export default class Boot extends AbstractScene {
    // private title: RenderText;
    // private subtitle: RenderText;

    public preload(): void {

    }

    public create(): void {
        this.scene_context = new SceneContext();
        this.scene.start('combat', {
            scene_context: this.scene_context
        });
    }
}