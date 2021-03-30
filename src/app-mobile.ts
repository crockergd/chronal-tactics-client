const css: any = require('../assets/styles/style.css');
import AbstractGame from './abstracts/abstractgame';
import * as Constants from './utils/constants';

{
    let lockOrientation: any = (<any>screen).lockOrientation || (<any>screen).mozLockOrientation || (<any>screen).msLockOrientation || (<any>screen).orientation.lock;
    if (lockOrientation) lockOrientation('landscape'); // allow device rotation

    const dpr: number = window.devicePixelRatio;

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.AUTO,
        render: {
            pixelArt: true,
            transparent: false
        },
        banner: {
            hidePhaser: true
        },
        scale: {
            mode: Phaser.Scale.FIT,
            width: '100%', 
            height: '100%'
        }
    };

    const game: AbstractGame = new AbstractGame(config);
}