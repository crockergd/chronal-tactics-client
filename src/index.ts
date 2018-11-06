import { AbstractGame } from './phaser/abstractgame';

window.addEventListener('DOMContentLoaded', () => {
    let width: number = screen.width;
    let height: number = screen.height;

    let dpr: number = window.devicePixelRatio;

    const config: GameConfig = {
        width: width,
        height: height,
        type: Phaser.AUTO,
        resolution: dpr
    };

    const game: AbstractGame = new AbstractGame(config);
});