import Boot from '../scenes/boot';
import Combat from '../scenes/combat';
import { Game } from 'phaser';
import SceneContext from '../contexts/scenecontext';

export default class AbstractGame extends Game {
    constructor(config: GameConfig) {
        super(config);

        const scene_context: SceneContext = new SceneContext();

        this.scene.add('boot', Boot);
        this.scene.add('combat', Combat);

        this.scene.start('boot', {
            scene_context: scene_context
        });
    }
}