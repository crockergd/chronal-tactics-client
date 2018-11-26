import Sio from 'socket.io-client';
import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';

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
        this.events.once('shutdown', () => {
            if (this.title) this.title.destroy();
            if (this.subtitle) this.subtitle.destroy();
            if (this.footer) this.footer.destroy();
            if (this.name) this.name.destroy();

            this.state = null;
            this.matchmaking_started = null;
        }, this);

        this.state = LobbyState.IDLE;

        this.title = this.renderer.add_text(this.renderer.center_x, this.renderer.center_y - this.renderer.height / 16, 'Isochronal Knights');
        this.title.framework_object.setAlign('center');
        this.title.set_font_size(84);
        this.title.set_anchor(0.5, 0.5);

        this.subtitle = this.renderer.add_text(this.cameras.main.width - this.renderer.buffer, this.renderer.buffer, '');
        this.subtitle.set_anchor(1, 0);

        this.footer = this.renderer.add_text(this.renderer.center_x, this.renderer.height, '');
        this.footer.set_font_size(24);
        this.footer.set_anchor(0.5, 1);
        this.footer.set_position(this.footer.x, this.footer.y - ((this.footer.height * 2) + this.renderer.buffer));

        this.name = this.renderer.add_text(this.renderer.buffer, this.renderer.buffer, this.settings.name);
        this.name.set_font_size(28);

        const connect_btn: AbstractSprite = this.renderer.add_sprite(this.footer.x, this.footer.y, 'generic_btn');
        connect_btn.set_scale(2.0, 2.0);
        connect_btn.set_position(connect_btn.x, connect_btn.y - (connect_btn.height * 2));

        const connect_text: AbstractText = this.renderer.add_text(connect_btn.x, connect_btn.y, 'Play');
        connect_text.set_font_size(36);
        connect_text.set_anchor(0.5, 0.5);

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
                    name: this.settings.name,
                    units: this.settings.units
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

            this.footer.text += '     ';
            this.footer.text += now.getMinutes().toString();
            this.footer.text += ':'
            if (now.getSeconds() < 10) this.footer.text += '0';
            this.footer.text += now.getSeconds().toString();
        }
    }

    private connect(): void {
        this.socket = Sio('https://radbee.me:3010');
        // this.socket = Sio('localhost:3010');
    }
}