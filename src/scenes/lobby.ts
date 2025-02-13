import { io } from 'socket.io-client';
import AbstractButton from '../abstracts/abstractbutton';
import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractText from '../abstracts/abstracttext';
import * as Constants from '../utils/constants';
import TextType from '../ui/texttype';

enum LobbyState {
    IDLE,
    MATCHMAKING
}

export default class Lobby extends AbstractScene {
    private title: AbstractText;
    private subtitle: AbstractText;
    private footer: AbstractText;
    private name: AbstractText;

    private state: LobbyState;
    private matchmaking_started: Date;

    public get connected(): boolean {
        return this.socket && this.socket.connected;
    }

    public create(): void {
        this.state = LobbyState.IDLE;

        const bg: AbstractSprite = this.render_context.add_sprite(0, 0, 'gradient', null, true);

        this.title = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y - this.render_context.height / 16, 'Chronal Tactics');
        this.title.set_font_type(TextType.DEFAULT_LG);
        this.title.set_anchor(0.5, 0.5);

        this.subtitle = this.render_context.add_text(this.cameras.main.width - this.render_context.buffer, this.render_context.buffer, '');
        this.subtitle.set_anchor(1, 0);

        this.footer = this.render_context.add_text(this.render_context.center_x, this.render_context.height - this.render_context.buffer, '');
        this.footer.set_anchor(0.5, 1);

        this.name = this.render_context.add_text(this.render_context.buffer, this.render_context.buffer, this.settings.name);

        const connect_btn: AbstractButton = this.render_context.add_button(this.footer.x, this.footer.y, 'generic_btn', 'Play');
        connect_btn.set_position(this.render_context.buffer * 2, -(connect_btn.height * 2), true);

        const training_btn: AbstractButton = this.render_context.add_button(this.footer.x, this.footer.y, 'generic_btn', 'Training');
        training_btn.set_position(-(connect_btn.width + (this.render_context.buffer * 2)), -(connect_btn.height * 2), true);

        connect_btn.on('pointerup', () => {
            if (this.state === LobbyState.IDLE) {
                if (!this.connected) {
                    this.footer.text = 'Can\'t Connect to Server';
                    return;
                }

                this.footer.text = 'Matchmaking...';

                this.socket.once('matched', (payload: any) => {
                    this.start('combat', {
                        scene_context: this.scene_context,
                        socket: this.socket,
                        combat_data: payload
                    });
                });

                this.socket.emit('matchmake', {
                    name: this.settings.name
                });

                this.matchmaking_started = new Date();

                this.state = LobbyState.MATCHMAKING;
            }
        });

        training_btn.on('pointerup', () => {
            if (this.state === LobbyState.IDLE) {
                if (!this.connected) {
                    this.footer.text = 'Can\'t Connect to Server';
                    return;
                }

                this.footer.text = 'Matchmaking...';

                this.socket.once('matched', (payload: any) => {
                    this.start('combat', {
                        scene_context: this.scene_context,
                        socket: this.socket,
                        combat_data: payload
                    });
                });

                this.socket.emit('matchmake_training', {
                    name: this.settings.name
                });

                this.matchmaking_started = new Date();

                this.state = LobbyState.MATCHMAKING;
            }
        });
    }

    public update(time: number, dt_ms: number): void {
        if (!this.socket) this.connect();

        if (this.state === LobbyState.MATCHMAKING) {
            const now: Date = new Date(new Date().getTime() - this.matchmaking_started.getTime());

            this.footer.text = 'Matchmaking';

            this.footer.text += ' ';
            this.footer.text += now.getMinutes().toString();
            this.footer.text += ':'
            if (now.getSeconds() < 10) this.footer.text += '0';
            this.footer.text += now.getSeconds().toString();
        }
    }

    private connect(): void {
        this.socket = io(Constants.SERVER_ADDR);
    }
}