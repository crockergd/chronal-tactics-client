import Boot from '../scenes/boot';
import { Game } from 'phaser';

export default class AbstractGame extends Game {
    constructor(config: Phaser.Types.Core.GameConfig) {
        super(config);

        this.scene.add('boot', Boot);
        this.scene.start('boot');
    }
}