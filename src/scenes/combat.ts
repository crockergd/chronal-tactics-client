import { Entity, Vector } from 'turn-based-combat-framework';
import Stage from '../stages/stage';
import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';
import CombatRenderer from './combatrenderer';

enum CombatState {
    CREATED,
    DEPLOYMENT_STARTED,
    DEPLOYMENT_COMPLETE,
    BATTLE_STARTED,
    BATTLE_COMPLETE
}

export default class Combat extends AbstractScene {
    private renderer: CombatRenderer;

    private stage: Stage;
    private state: CombatState;

    private movement_entity: Entity;
    private movement_x: number;
    private movement_y: number;

    private deploy_max: number;
    private deploy_count: number;
    private deploy_class: string;
    private deploy_position: Vector;

    private players_ready: number;
    private players_max: number = 2;

    private packet_resend: number = 1;
    private packet_sent: number = 0;

    private timer: number = 0;
    private interval: number = 3;

    // server is preventing units from moving to a space a unit is in, even if unit is leaving that turn
    // redraw unit sprites
    // add tutorial
    // add catch for players who deploy 0 units

    private get players_ready_string(): string {
        return 'Players Ready: ' + this.players_ready + ' / 2';
    }

    private get units_deployed_string(): string {
        return 'Units Deployed: ' + this.deploy_count + ' / ' + this.deploy_max;
    }

    public create(): void {
        this.socket.once('disconnect', () => { this.drop_to_lobby(); });
        this.socket.once('room-closed', () => { this.drop_to_lobby(); });

        this.players_ready = 0;

        this.change_state(CombatState.CREATED);
        this.settings.team = this.combat_data.team;
        this.settings.opponent = this.combat_data.opponent;
        this.stage = Stage.fromJSON(JSON.parse(this.combat_data.stage));

        this.renderer = new CombatRenderer(this.render_context, this.settings, this.stage.height);

        const bg: AbstractSprite = this.render_context.add_sprite(0, 0, 'gradient');
        bg.affix_ui();

        this.renderer.render_stage(this.stage);
        this.renderer.render_entities(this.stage);
        this.renderer.render_team_ui();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.movement_x = pointer.x;
            this.movement_y = pointer.y;
        });

        this.socket.on('deployment-started', (deployment_payload: any) => {
            if (this.state !== CombatState.CREATED) return;
            this.change_state(CombatState.DEPLOYMENT_STARTED);

            this.deploy_max = deployment_payload.deployment_max;
            const deployment_tiles: Array<Vector> = deployment_payload.deployment_tiles;
            this.begin_deployment(deployment_tiles);
        });

        this.socket.on('player-readied', (payload: any) => {
            if (!(this.state === CombatState.DEPLOYMENT_STARTED || this.state === CombatState.DEPLOYMENT_COMPLETE)) return;
            this.players_ready = payload.players_ready;
        });

        this.socket.on('battle-started', (payload: any) => {
            if (this.state !== CombatState.DEPLOYMENT_COMPLETE) return;
            this.change_state(CombatState.BATTLE_STARTED);

            this.stage.destroy();
            this.stage = null;

            this.stage = Stage.fromJSON(JSON.parse(payload.stage));
            this.begin_battle();

            this.interval = payload.interval;
            this.timer = this.interval;
        });

        this.socket.on('battle-completed', (payload: any) => {
            this.socket.removeAllListeners();
            this.input.removeAllListeners();

            this.renderer.render_battle_completed(payload.winning_team);

            this.input.once('pointerup', this.drop_to_lobby, this);
        });

        this.socket.on('post-tick', (payload: any) => {
            if (this.state !== CombatState.BATTLE_STARTED) return;

            const turn_json: any = payload.turn;
            this.stage.battle.deserialize_turn(turn_json);

            for (const entity of this.stage.entities) {
                if (entity.get('facing_sprite')) {
                    entity.get('facing_sprite').destroy();
                    entity.set('facing_sprite', null);
                }
            }

            this.renderer.render_turn(this.stage.battle.get_last_turn());
            this.renderer.update_depth(this.stage.entities);

            this.interval = payload.interval;
            this.timer = this.interval;
        });

        this.ready_packet();
    }

    public update(time: number, dt_ms: number): void {
        const dt: number = dt_ms / 1000;
        this.packet_sent += dt;

        if (this.packet_sent > this.packet_resend) {
            switch (this.state) {
                case CombatState.CREATED:
                    this.socket.emit('deployment-ready');
                    break;

                case CombatState.DEPLOYMENT_COMPLETE:
                    this.socket.emit('battle-ready', {
                        entities: this.stage.battle.get_entities().map((entity: Entity) => {
                            return [entity.identifier.class_key, entity.spatial.position];
                        })
                    });
                    break;
            }

            this.packet_sent = 0;
        }

        switch (this.state) {
            case CombatState.DEPLOYMENT_STARTED:
            case CombatState.DEPLOYMENT_COMPLETE:
                if (this.renderer.ready_stat_text.text !== this.players_ready_string) this.renderer.ready_stat_text.text = this.players_ready_string;
                if (this.renderer.deploy_stat_text.text !== this.units_deployed_string) this.renderer.deploy_stat_text.text = this.units_deployed_string;
                break;

            case CombatState.BATTLE_STARTED:
                this.timer -= dt;
                this.timer = Math.max(0, this.timer);
                this.renderer.render_timer(this.timer, this.interval);
                break;
        }
    }

    /**
     * Readies the next packet to be sent on the next update loop instead of waiting for the resend period
     */
    private ready_packet(): void {
        this.packet_sent = this.packet_resend;
    }

    /**
     * Constructs, serializes, and sends a resoluble packet to the server
     * 
     * @param key - Resoluble type name
     * @param args - Resoluble constructor args
     */
    private fire_resoluble(key: string, ...args: any[]): void {
        const resoluble: any = this.stage.battle.serialize_resoluble(key, ...args);
        this.socket.emit('resoluble', {
            resoluble: resoluble
        });
    }

    private begin_deployment(deployment_tiles: Array<Vector>): void {
        this.renderer.render_deployment_ui(deployment_tiles);

        this.deploy_count = 0;

        for (const sprite of this.renderer.deploy_classes) {
            sprite.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
                if (this.deploy_count >= this.deploy_max) return;

                this.deploy_class = sprite.key;
                this.renderer.render_deployment_unit(this.deploy_class);

                this.renderer.display_deployment_ui(false);
                this.renderer.deploy_unit.set_visible(true);
                this.renderer.deploy_unit.set_position(pointer.worldX, pointer.worldY + this.renderer.entity_adjust_y);
            }, this);
        }

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.deploy_class) return;

            this.deploy_position = null;

            const local_pos: Vector = this.renderer.world_to_local(new Vector(pointer.worldX, pointer.worldY));
            if (!this.renderer.local_within_specific(local_pos, deployment_tiles)) {
                this.renderer.deploy_unit.set_visible(true);
                this.renderer.deploy_unit.set_position(pointer.worldX, pointer.worldY + this.renderer.entity_adjust_y);
                // this.renderer.deploy_unit.set_visible(false);
                return;
            }

            if (this.stage.get_entity_by_position(local_pos)) {  
                this.renderer.deploy_unit.set_visible(false);
                return;
            }

            this.deploy_position = new Vector(local_pos.x, local_pos.y);
            const world_pos: Vector = this.renderer.local_to_world(local_pos);
            this.renderer.deploy_unit.set_position(world_pos.x, world_pos.y + this.renderer.entity_adjust_y);
            this.renderer.deploy_unit.set_visible(true);
        }, this);

        this.input.on('pointerup', () => {
            if (!this.deploy_class || !this.deploy_position) {
                this.clear_deployment();
                return;
            }

            const entity: Entity = new Entity();
            entity.identifier.class_key = this.deploy_class;
            entity.combat.alive = true;
            entity.combat.current_health = 1;
            entity.spatial = {
                position: this.deploy_position,
                facing: this.team === 0 ? new Vector(1, -1, 0) : new Vector(-1, 1, 0),
                has_moved: false
            };

            this.stage.battle.add_entity(entity, this.team);
            this.deploy_count++;

            this.renderer.render_entities(this.stage);
            this.renderer.update_depth(this.stage.entities);

            this.clear_deployment();
        });

        this.renderer.ready_btn.once('pointerup', () => {
            this.change_state(CombatState.DEPLOYMENT_COMPLETE);
            this.ready_packet();
        }, this);
    }

    private clear_deployment(): void {
        this.deploy_position = null;
        this.deploy_class = null;
        if (this.renderer.deploy_unit) {
            this.renderer.deploy_unit.destroy();
            this.renderer.deploy_unit = null;

            this.renderer.display_deployment_ui(true);

        }
    }

    private begin_battle(): void {
        this.renderer.destroy_deployment_ui();

        this.input.removeAllListeners();
        this.init_input();

        this.renderer.render_entities(this.stage);
        this.renderer.update_depth(this.stage.entities);

        const center_world: Vector = this.renderer.local_to_world(this.stage.get_center());
        this.render_context.camera.pan(center_world.x, center_world.y);
    }

    private init_input(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.movement_x = pointer.x;
            this.movement_y = pointer.y;

            for (const entity of this.stage.entities) {
                if (this.game.input.hitTest(pointer, [entity.get('sprite').framework_object], this.render_context.camera).length) {
                    this.movement_entity = entity;
                    return;
                }
            }
        }, this);

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.movement_entity) return;
            if (!this.movement_entity.alive) return;
            if (Math.abs(pointer.x - this.movement_x) < 30) return;
            if (Math.abs(pointer.y - this.movement_y) < 30) return;
            if (this.movement_entity.identifier.team !== this.team) {
                this.movement_entity = null;
                return;
            }

            const facing: Vector = new Vector(0, 0);

            if (pointer.x > this.movement_x) {
                facing.x = 1;
            } else {
                facing.x = -1;
            }

            if (pointer.y > this.movement_y) {
                facing.y = 1;
            } else {
                facing.y = -1;
            }

            if (this.movement_entity.get('facing_sprite')) {
                this.movement_entity.get('facing_sprite').destroy();
                this.movement_entity.set('facing_sprite', null);
            }

            const facing_sprite: AbstractSprite = this.render_context.add_sprite(this.movement_entity.get('sprite').x, this.movement_entity.get('sprite').y, 'directional_ring');
            facing_sprite.set_scale(this.renderer.unit_scalar, this.renderer.unit_scalar);
            facing_sprite.set_anchor(0.5, 0.4);
            facing_sprite.set_depth(this.renderer.facing_depth);

            if (facing.x > 0 && facing.y > 0) {
                facing_sprite.set_frame(1);
            } else if (facing.x > 0 && facing.y < 0) {
                facing_sprite.set_frame(3);
            } else if (facing.x < 0 && facing.y > 0) {
                facing_sprite.set_frame(0);
            } else if (facing.x < 0 && facing.y < 0) {
                facing_sprite.set_frame(2);
            }

            this.movement_entity.set('facing_sprite', facing_sprite);

            this.fire_resoluble('Face', this.movement_entity, facing);
            this.fire_resoluble('Move', this.movement_entity);

            this.movement_entity = null;
        }, this);

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!pointer.isDown) return;
            if (this.movement_entity) return;

            const scroll_x: number = (this.movement_x - pointer.x) / 2;
            const scroll_y: number = (this.movement_y - pointer.y) / 2;

            this.movement_x = pointer.x;
            this.movement_y = pointer.y;

            // this.render_context.camera.setScroll(this.render_context.camera.scrollX + scroll_x, this.render_context.camera.scrollY + scroll_y);
        }, this);
    }

    private change_state(state: CombatState): void {
        // console.log('State changed from ' + this.state + ' to ' + state + '.');
        this.state = state;
    }

    private drop_to_lobby(): void {
        if (this.socket) this.socket.removeAllListeners();
        this.input.removeAllListeners();

        this.start('lobby', {
            scene_context: this.scene_context,
            socket: this.socket
        });
    }
}