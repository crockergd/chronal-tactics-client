const css: any = require('../assets/styles/style.css');
import AbstractGame from './abstracts/abstractgame';
import * as Constants from './utils/constants';

{
    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    const dpr: number = window.devicePixelRatio;

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.CANVAS,
        backgroundColor: '#030303',
        render: {
            pixelArt: true,
            transparent: false
        },
        scale: {
            width: width,
            height: height,
            resolution: dpr
        }
    };

    const game: AbstractGame = new AbstractGame(config);
}