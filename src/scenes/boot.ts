import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import MathExtensions from '../utils/mathextensions';

export default class Boot extends AbstractScene {
    private title: AbstractText;
    private subtitle: AbstractText;

    private adjectives: Array<string>;
    private firstnames: Array<string>;

    public preload(): void {
        this.title = this.renderer.add_text(this.renderer.center_x, this.renderer.center_y - this.renderer.height / 16, 'Isochronal Knights');
        this.title.framework_object.setAlign('center');
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
        const adjectives: Array<string> = this.cache.json.get('adjectives').adjectives;
        const firstnames: Array<string> = this.cache.json.get('firstnames').firstnames;

        const adjective: string = adjectives[MathExtensions.rand_int_inclusive(0, adjectives.length - 1)];
        const firstname: string = firstnames[MathExtensions.rand_int_inclusive(0, firstnames.length - 1)];

        this.settings.name = (adjective.charAt(0).toUpperCase() + adjective.slice(1)) + ' ' + firstname;

        this.settings.units = ['spearman', 'bandit'];

        this.scene.start('lobby', {
            scene_context: this.scene_context
        });
    }

    private load_assets(): void {
        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        const require_tilesheet: __WebpackModuleApi.RequireContext = require.context('../../assets/tilesheets/', true);
        const require_json: __WebpackModuleApi.RequireContext = require.context('../../assets/json/', true);
        const require_font: __WebpackModuleApi.RequireContext = require.context('../../assets/fonts/', true);

        this.load.image('dirt', require_image('./dirt.png'));
        this.load.image('tile', require_image('./tile.png'));
        this.load.image('generic_btn', require_image('./generic_btn.png'));

        // this.load.spritesheet('bandit', require_tilesheet('./bandit.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('bandit_blue', require_tilesheet('./bandit_blue.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('bandit_red', require_tilesheet('./bandit_red.png'), { frameWidth: 110, frameHeight: 110 });
        // this.load.spritesheet('spearman', require_tilesheet('./spearman.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('spearman_blue', require_tilesheet('./spearman_blue.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('spearman_red', require_tilesheet('./spearman_red.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('attack_effect', require_tilesheet('./attack_effect.png'), { frameWidth: 80, frameHeight: 110 });

        this.load.json('adjectives', require_json('./adjectives.json'));
        this.load.json('firstnames', require_json('./firstnames.json'));
    }
}