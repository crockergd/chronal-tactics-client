import Boot from '../scenes/boot';
import Combat from '../scenes/combat';
import { Game } from 'phaser';

export class AbstractGame extends Game {
    constructor(config: GameConfig) {
        super(config);

        this.scene.add('boot', Boot);
        this.scene.add('combat', Combat);

        this.scene.start('boot');
    }
}