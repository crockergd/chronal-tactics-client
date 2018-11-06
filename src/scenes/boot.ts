import SceneContext from '../contexts/scenecontext';
import AbstractScene from '../phaser/abstractscene';
import { AbstractText } from '../phaser/abstracttext';

export default class Boot extends AbstractScene {
    private title: AbstractText;
    private subtitle: AbstractText;

    public preload(): void {
        this.title = this.scene_context.renderer.add_text(this.cameras.main.centerX, this.cameras.main.centerY - this.cameras.main.height / 30, 'Github Game-Off 2018');
        this.title.set_font_size(32);
        this.title.set_origin(0.5, 0.5);

        this.subtitle = this.scene_context.renderer.add_text(this.cameras.main.centerX, this.cameras.main.centerY, '');
        this.subtitle.set_origin(0.5, 0.5);

        this.load.on('progress', (percentage: number) => {
            this.subtitle.text = 'Loading ' + Math.round(percentage * 100) + '%';
        });

        this.load.on('complete', () => {
            this.subtitle.text = 'Click to Start';
        });

        this.load_assets();
    }

    public create(): void {
        this.input.on('pointerup', () => {
            this.scene.start('combat', {
                scene_context: this.scene_context
            });
        });
    }

    private load_assets(): void {
        let require_tilesheet: __WebpackModuleApi.RequireContext = require.context('../../assets/tilesheets/', true);

        this.load.spritesheet('bandit', require_tilesheet('./bandit.png'), { frameWidth: 110, frameHeight: 110 });
    }
}