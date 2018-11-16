import AbstractGame from './abstracts/abstractgame';

window.addEventListener('DOMContentLoaded', () => {
    let width: number = window.innerWidth;
    let height: number = window.innerHeight

    let dpr: number = window.devicePixelRatio;

    const config: GameConfig = {
        width: width,
        height: height,
        type: Phaser.AUTO,
        resolution: dpr
    };

    const game: AbstractGame = new AbstractGame(config);

    // window.addEventListener('resize', () => {
    //     let width: number = window.innerWidth;
    //     let height: number = window.innerHeight

    //     game.resize(width, height);
    // });
});