import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';

export default class Boot extends AbstractScene {
    private title: AbstractText;
    private subtitle: AbstractText;

    public preload(): void {
        this.title = this.renderer.add_text(this.renderer.center_x, this.renderer.center_y - this.renderer.height / 16, 'Github Game-Off 2018');
        this.title.set_font_size(84);
        this.title.set_origin(0.5, 0.5);

        this.subtitle = this.renderer.add_text(this.cameras.main.width - this.renderer.buffer, this.renderer.buffer, '');
        this.subtitle.set_origin(1, 0);

        this.load.on('progress', (percentage: number) => {
            this.subtitle.text = Math.round(percentage * 100) + '%';
        });

        this.load_assets();
    }

    public create(): void {
        this.scene.start('lobby', {
            scene_context: this.scene_context
        });
    }

    private load_assets(): void {
        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        const require_tilesheet: __WebpackModuleApi.RequireContext = require.context('../../assets/tilesheets/', true);

        this.load.image('dirt', require_image('./dirt.png'));
        this.load.image('tile', require_image('./tile.png'));
        this.load.image('generic_btn', require_image('./generic_btn.png'));

        this.load.spritesheet('bandit', require_tilesheet('./bandit.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('spearman', require_tilesheet('./spearman.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('attack_effect', require_tilesheet('./attack_effect.png'), { frameWidth: 80, frameHeight: 110 });
    }
}