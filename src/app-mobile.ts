const css: any = require('../assets/styles/style.css');
import AbstractGame from './abstracts/abstractgame';

{
    let lockOrientation: any = (<any>screen).lockOrientation || (<any>screen).mozLockOrientation || (<any>screen).msLockOrientation || (<any>screen).orientation.lock;
    if (lockOrientation) lockOrientation('landscape'); // allow device rotation

    const width: number = window.innerWidth;
    const height: number = window.innerHeight;
    const dpr: number = window.devicePixelRatio;

    const config: GameConfig = {
        type: Phaser.CANVAS,
        width: width,
        height: height,
        resolution: dpr,
        render: {
            pixelArt: true
        }
    };

    const game: AbstractGame = new AbstractGame(config);
}