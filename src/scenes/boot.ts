import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import SceneContext from '../contexts/scenecontext';
import CanvasExtensions from '../utils/canvasextensions';
import Color from '../utils/color';
import MathExtensions from '../utils/mathextensions';
import Combat from './combat';
import Lobby from './lobby';

export default class Boot extends AbstractScene {
    private title: AbstractText;
    private subtitle: AbstractText;

    private adjectives: Array<string>;
    private firstnames: Array<string>;

    public preload(): void {
        this.scene_context = new SceneContext(this);

        // this.game.scale.setGameSize(this.render_context.width * this.render_context.DPR, this.render_context.height * this.render_context.DPR);

        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        this.load.image('radbee_logo', require_image('./radbee_logo.png')).once('filecomplete-image-radbee_logo', () => {
            const offset_y: number = this.render_context.literal(10);

            const logo: AbstractSprite = this.render_context.add_sprite(this.render_context.center_x, this.render_context.center_y - offset_y, 'radbee_logo');
            logo.set_anchor(0.5, 0.5);
            logo.set_alpha(0);

            this.tweens.add({
                targets: [logo.framework_object],
                alpha: 1,
                duration: 200
            });
        }, this);

        this.load_states();
        this.load_assets();
    }

    public create(): void {
        this.load_derived();

        this.register_animations();

        const character_limit: number = 9;

        const adjectives: Array<string> = this.cache.json.get('adjectives').adjectives.filter(adjective => adjective.length <= character_limit);
        const firstnames: Array<string> = this.cache.json.get('firstnames').firstnames.filter(firstname => firstname.length <= character_limit);

        const adjective: string = adjectives[MathExtensions.rand_int_inclusive(0, adjectives.length - 1)];
        const firstname: string = firstnames[MathExtensions.rand_int_inclusive(0, firstnames.length - 1)];

        this.settings.name = adjective + ' ' + firstname;

        this.start('lobby', {
            scene_context: this.scene_context
        });
    }

    private load_states(): void {
        this.scene.add('lobby', Lobby, false);
        this.scene.add('combat', Combat, false);
    }

    private load_assets(): void {
        const require_bitmap: __WebpackModuleApi.RequireContext = require.context('../../assets/bitmaps/', true);
        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        const require_tilesheet: __WebpackModuleApi.RequireContext = require.context('../../assets/tilesheets/', true);
        const require_json: __WebpackModuleApi.RequireContext = require.context('../../assets/json/', true);

        this.load.bitmapFont('silkscreen', require_bitmap('./silkscreen_0.png'), require_bitmap('./silkscreen.fnt'));
        this.load.bitmapFont('silkscreen_lg', require_bitmap('./silkscreen_lg_0.png'), require_bitmap('./silkscreen_lg.fnt'));
        this.load.bitmapFont('silkscreen_sm', require_bitmap('./silkscreen_sm_0.png'), require_bitmap('./silkscreen_sm.fnt'));

        this.load.spritesheet('sword_unit', require_tilesheet('./sword_unit.png'), { frameWidth: 20, frameHeight: 30 });
        this.load.spritesheet('spear_unit', require_tilesheet('./spear_unit.png'), { frameWidth: 20, frameHeight: 30 });
        this.load.spritesheet('bow_unit', require_tilesheet('./bow_unit.png'), { frameWidth: 20, frameHeight: 30 });
        this.load.spritesheet('directional_ring', require_tilesheet('./directional_ring.png'), { frameWidth: 30, frameHeight: 30 });
        this.load.spritesheet('attack_effect', require_tilesheet('./attack_effect.png'), { frameWidth: 30, frameHeight: 30 });

        this.load.image('base_tile', require_image('./base_tile.png'));
        this.load.image('blue_tile', require_image('./blue_tile.png'));
        this.load.image('red_tile', require_image('./red_tile.png'));
        this.load.image('generic_btn', require_image('./generic_btn.png'));
        this.load.image('unit_frame', require_image('./unit_frame.png'));
        this.load.image('red_banner', require_image('./red_banner.png'));
        this.load.image('blue_banner', require_image('./blue_banner.png'));

        this.load.json('adjectives', require_json('./adjectives.json'));
        this.load.json('firstnames', require_json('./firstnames.json'));

        const gradient_texture: Phaser.Textures.CanvasTexture = this.textures.createCanvas('gradient', this.render_context.width, this.render_context.height);
        const gradient_context: CanvasRenderingContext2D = gradient_texture.getContext();
        const gradient: CanvasGradient = gradient_context.createLinearGradient(gradient_texture.width / this.render_context.base_scale_factor, 0, gradient_texture.width / this.render_context.base_scale_factor, gradient_texture.height);

        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(1, '#004CB3');

        gradient_texture.getContext().fillStyle = gradient;
        gradient_texture.getContext().fillRect(0, 0, gradient_texture.width * 2, gradient_texture.height * 2);

        gradient_texture.refresh();
    }

    private load_derived(): void {
        CanvasExtensions.radial_gradient(this, 'highlight', 600, 600, new Color(0, 0, 0, 0.6), new Color(0, 0, 0, 0));
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
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 0,
                end: 0
            })
        });
        this.anims.create({
            key: 'idle_backward_sword_unit_blue',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 1,
                end: 1
            })
        });
        this.anims.create({
            key: 'death_sword_unit_blue',
            frameRate: 1,
            frames: [{
                key: 'sword_unit',
                frame: 2
            }]
        });

        this.anims.create({
            key: 'idle_forward_sword_unit_red',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 3,
                end: 3
            })
        });
        this.anims.create({
            key: 'idle_backward_sword_unit_red',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('sword_unit', {
                start: 4,
                end: 4
            })
        });
        this.anims.create({
            key: 'death_sword_unit_red',
            frameRate: 1,
            frames: [{
                key: 'sword_unit',
                frame: 5
            }]
        });

        this.anims.create({
            key: 'idle_forward_spear_unit_blue',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 0,
                end: 0
            })
        });
        this.anims.create({
            key: 'idle_backward_spear_unit_blue',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 1,
                end: 1
            })
        });
        this.anims.create({
            key: 'death_spear_unit_blue',
            frameRate: 1,
            frames: [{
                key: 'spear_unit',
                frame: 2
            }]
        });

        this.anims.create({
            key: 'idle_forward_spear_unit_red',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 3,
                end: 3
            })
        });
        this.anims.create({
            key: 'idle_backward_spear_unit_red',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('spear_unit', {
                start: 4,
                end: 4
            })
        });
        this.anims.create({
            key: 'death_spear_unit_red',
            frameRate: 1,
            frames: [{
                key: 'spear_unit',
                frame: 5
            }]
        });

        this.anims.create({
            key: 'idle_forward_bow_unit_blue',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 0,
                end: 0
            })
        });
        this.anims.create({
            key: 'idle_backward_bow_unit_blue',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 1,
                end: 1
            })
        });
        this.anims.create({
            key: 'death_bow_unit_blue',
            frameRate: 1,
            frames: [{
                key: 'bow_unit',
                frame: 2
            }]
        });

        this.anims.create({
            key: 'idle_forward_bow_unit_red',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 3,
                end: 3
            })
        });
        this.anims.create({
            key: 'idle_backward_bow_unit_red',
            frameRate: 1,
            frames: this.anims.generateFrameNumbers('bow_unit', {
                start: 4,
                end: 4
            })
        });
        this.anims.create({
            key: 'death_bow_unit_red',
            frameRate: 1,
            frames: [{
                key: 'bow_unit',
                frame: 5
            }]
        });
    }
}