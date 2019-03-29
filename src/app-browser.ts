const css: any = require('../assets/styles/style.css');
import AbstractGame from './abstracts/abstractgame';

{
    let width: number = window.innerWidth;
    let height: number = window.innerHeight

    let dpr: number = window.devicePixelRatio;

    const config: GameConfig = {
        type: Phaser.CANVAS,
        width: width,
        height: height,
        resolution: dpr,
        render: {
            pixelArt: true,
        }
    };

    const game: AbstractGame = new AbstractGame(config);
}