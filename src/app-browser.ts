const css: any = require('../assets/styles/style.css');
import AbstractGame from './abstracts/abstractgame';
import * as Constants from './utils/constants';

{
    const dpr: number = window.devicePixelRatio;

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO, 
        disableContextMenu: true,
        render: {
            pixelArt: true,
            transparent: false
        },
        scale: {
            mode: Phaser.Scale.FIT,
            width: '100%',
            height: '100%'
        }
    };

    const game: AbstractGame = new AbstractGame(config);
}