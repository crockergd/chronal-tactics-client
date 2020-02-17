const css: any = require('../assets/styles/style.css');
import AbstractGame from './abstracts/abstractgame';

{
    let lockOrientation: any = (<any>screen).lockOrientation || (<any>screen).mozLockOrientation || (<any>screen).msLockOrientation || (<any>screen).orientation.lock;
    if (lockOrientation) lockOrientation('landscape'); // allow device rotation

    const width: number = screen.width;
    const height: number = screen.height;
    const dpr: number = window.devicePixelRatio;

    const config: Phaser.Types.Core.GameConfig = {
        type: Phaser.CANVAS,
        backgroundColor: '#030303',
        banner: false,
        render: {
            pixelArt: true,
            transparent: false
        },
        scale: {
            mode: Phaser.Scale.FIT,
            width: width,
            height: height,
            resolution: dpr,
            autoRound: false
        }
    };

    const game: AbstractGame = new AbstractGame(config);
}