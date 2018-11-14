import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import Sio from 'socket.io-client';

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
            this.subtitle.text = 'Click to Connect';
        });

        this.load_assets();
    }

    public create(): void {
        this.input.once('pointerup', () => {
            this.subtitle.text = 'Connecting...';

            const socket: SocketIOClient.Socket = Sio('http://localhost:3010');
            socket.on('connect', () => {
                this.subtitle.text = 'Matchmaking...';

                socket.emit('init', {
                    name: 'George',
                    units: ['bandit', 'bandit', 'spearman', 'spearman']
                });
            });
            socket.on('matched', (payload: any) => {
                this.scene.start('combat', {
                    scene_context: this.scene_context,
                    socket: socket,
                    combat_data: payload
                });
            });
        });
    }

    private load_assets(): void {
        const require_image: __WebpackModuleApi.RequireContext = require.context('../../assets/images/', true);
        const require_tilesheet: __WebpackModuleApi.RequireContext = require.context('../../assets/tilesheets/', true);

        this.load.image('dirt', require_image('./dirt.png'));
        this.load.image('tile', require_image('./tile.png'));

        this.load.spritesheet('bandit', require_tilesheet('./bandit.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('spearman', require_tilesheet('./spearman.png'), { frameWidth: 110, frameHeight: 110 });
        this.load.spritesheet('attack_effect', require_tilesheet('./attack_effect.png'), { frameWidth: 80, frameHeight: 110 });
    }
}