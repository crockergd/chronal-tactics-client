import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import MathExtensions from '../utils/mathextensions';
import AbstractSprite from '../abstracts/abstractsprite';

export default class Boot extends AbstractScene {
    private title: AbstractText;
    private subtitle: AbstractText;

    private adjectives: Array<string>;
    private firstnames: Array<string>;

    public preload(): void {
        this.title = this.renderer.add_text(this.renderer.center_x, this.renderer.center_y - this.renderer.height / 16, 'Isochronal Knights');
        this.title.framework_object.setAlign('center');
        this.title.set_font_size(84);
        this.title.set_anchor(0.5, 0.5);

        this.subtitle = this.renderer.add_text(this.cameras.main.width - this.renderer.buffer, this.renderer.buffer, '');
        this.subtitle.set_anchor(1, 0);

        this.load.on('progress', (percentage: number) => {
            this.subtitle.text = Math.round(percentage * 100) + '%';
        });

        this.load_assets();
    }

    public create(): void {
        this.register_animations();

        const adjectives: Array<string> = this.cache.json.get('adjectives').adjectives;
        const firstnames: Array<string> = this.cache.json.get('firstnames').firstnames;

        const adjective: string = adjectives[MathExtensions.rand_int_inclusive(0, adjectives.length - 1)];
        const firstname: string = firstnames[MathExtensions.rand_int_inclusive(0, firstnames.length - 1)];

        this.settings.name = (adjective.charAt(0).toUpperCase() + adjective.slice(1)) + ' ' + firstname;

        this.settings.units = ['sword_unit', 'spear_unit'];

        this.scene.start('lobby', {
            scene_context: this.scene_context
        });
    }

    private load_assets(): void {
        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        const require_tilesheet: __WebpackModuleApi.RequireContext = require.context('../../assets/tilesheets/', true);
        const require_json: __WebpackModuleApi.RequireContext = require.context('../../assets/json/', true);

        this.load.spritesheet('sword_unit', require_tilesheet('./sword_unit.png'), { frameWidth: 20, frameHeight: 30 });
        this.load.spritesheet('spear_unit', require_tilesheet('./spear_unit.png'), { frameWidth: 20, frameHeight: 30 });
        this.load.spritesheet('bow_unit', require_tilesheet('./bow_unit.png'), { frameWidth: 20, frameHeight: 30 });

        this.load.spritesheet('attack_effect', require_tilesheet('./attack_effect.png'), { frameWidth: 80, frameHeight: 110 });

        this.load.image('base_tile', require_image('./base_tile.png'));
        this.load.image('deploy_tile', require_image('./deploy_tile.png'));
        this.load.image('generic_btn', require_image('./generic_btn.png'));
        this.load.image('unit_frame', require_image('./unit_frame.png'));

        this.load.json('adjectives', require_json('./adjectives.json'));
        this.load.json('firstnames', require_json('./firstnames.json'));

        const gradient_texture: Phaser.Textures.CanvasTexture = this.textures.createCanvas('gradient', this.renderer.width * 2, this.renderer.height * 2);
        const gradient_context: CanvasRenderingContext2D = gradient_texture.getContext();
        const gradient: CanvasGradient = gradient_context.createLinearGradient(gradient_texture.width / 2, 0, gradient_texture.width / 2, gradient_texture.height);

        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#004CB3');

        gradient_texture.getContext().fillStyle = gradient;
        gradient_texture.getContext().fillRect(0, 0, gradient_texture.width, gradient_texture.height);

        gradient_texture.refresh();
    }

    private register_animations(): void {
        this.anims.create({
            key: 'attack',
            frames: this.anims.generateFrameNumbers('attack_effect', {
                start: 0,
                end: 3
            })
        });

        this.anims.create({
            key: 'idle_forward_sword_unit_blue',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 0,
                end: 3
            })
        });
        this.anims.create({
            key: 'idle_backward_sword_unit_blue',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 4,
                end: 7
            })
        });
        this.anims.create({
            key: 'death_sword_unit_blue',
            frameRate: 6,
            frames: [{
                key: 'sword_unit',
                frame: 8
            }]
        });

        this.anims.create({
            key: 'idle_forward_sword_unit_red',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 9,
                end: 12
            })
        });
        this.anims.create({
            key: 'idle_backward_sword_unit_red',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 13,
                end: 16
            })
        });
        this.anims.create({
            key: 'death_sword_unit_red',
            frameRate: 6,
            frames: [{
                key: 'sword_unit',
                frame: 17
            }]
        });

        this.anims.create({
            key: 'idle_forward_spear_unit_blue',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 0,
                end: 3
            })
        });
        this.anims.create({
            key: 'idle_backward_spear_unit_blue',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 4,
                end: 7
            })
        });
        this.anims.create({
            key: 'death_spear_unit_blue',
            frameRate: 6,
            frames: [{
                key: 'spear_unit',
                frame: 8
            }]
        });

        this.anims.create({
            key: 'idle_forward_spear_unit_red',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 9,
                end: 12
            })
        });
        this.anims.create({
            key: 'idle_backward_spear_unit_red',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 13,
                end: 16
            })
        });
        this.anims.create({
            key: 'death_spear_unit_red',
            frameRate: 6,
            frames: [{
                key: 'spear_unit',
                frame: 17
            }]
        });

        this.anims.create({
            key: 'idle_forward_bow_unit_blue',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 0,
                end: 3
            })
        });
        this.anims.create({
            key: 'idle_backward_bow_unit_blue',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 4,
                end: 7
            })
        });
        this.anims.create({
            key: 'death_bow_unit_blue',
            frameRate: 6,
            frames: [{
                key: 'bow_unit',
                frame: 8
            }]
        });

        this.anims.create({
            key: 'idle_forward_bow_unit_red',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 9,
                end: 12
            })
        });
        this.anims.create({
            key: 'idle_backward_bow_unit_red',
            frameRate: 6,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 13,
                end: 16
            })
        });
        this.anims.create({
            key: 'death_bow_unit_red',
            frameRate: 6,
            frames: [{
                key: 'bow_unit',
                frame: 17
            }]
        });
    }
}