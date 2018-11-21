import { Entity, Vector } from 'turn-based-combat-framework';
import Stage from '../stages/stage';
import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractGroup from '../abstracts/abstractgroup';

enum CombatState {
    CREATED,
    DEPLOYMENT_STARTED,
    DEPLOYMENT_COMPLETE,
    BATTLE_STARTED,
    BATTLE_COMPLETE
}

export default class Combat extends AbstractScene {
    private stage: Stage;
    private team: number;
    private state: CombatState;

    private movement_entity: Entity;
    private movement_x: number;
    private movement_y: number;

    private deploy_stat_text: AbstractText;
    private ready_stat_text: AbstractText;

    private deploy_max: number;
    private deploy_count: number;
    private deploy_ui: AbstractGroup;
    private deploy_class: string;
    private deploy_position: Vector;
    private deploy_unit: AbstractSprite;

    private players_ready: number = 0;

    private ready_btn: AbstractSprite;
    private ready_text: AbstractText;

    private packet_resend: number = 1;
    private packet_sent: number = 0;

    // server is preventing units from moving to a space a unit is in, even if unit is leaving that turn
    // revisit stage centering code and camera bounds, probably have it center on your side on the middle of your team
    // z order units

    private get players_ready_string(): string {
        return 'Players Ready: ' + this.players_ready + ' / 2';
    }

    private get units_deployed_string(): string {
        return 'Units Deployed: ' + this.deploy_count + ' / ' + this.deploy_max;
    }

    public create(): void {
        this.socket.once('room-closed', () => {
            this.socket.removeAllListeners();

            this.scene.start('lobby', {
                scene_context: this.scene_context,
                socket: this.socket
            });
        });

        this.state = CombatState.CREATED;
        this.team = this.combat_data.team;
        this.stage = Stage.fromJSON(JSON.parse(this.combat_data.stage));

        const bg: AbstractSprite = this.renderer.add_sprite(0, 0, 'gradient');
        bg.affix_ui();

        this.renderer.render_stage(this.stage);
        this.scene_context.renderer.render_entities(this.stage); // prob remove

        const name_text: AbstractText = this.renderer.add_text(this.renderer.buffer, this.renderer.buffer, this.settings.name);
        name_text.set_font_size(28);
        name_text.affix_ui();

        const team_text: AbstractText = this.renderer.add_text(name_text.x, name_text.y + name_text.height + this.renderer.buffer, 'Team ' + (this.team === 0 ? 'Blue' : 'Red'));
        team_text.set_font_size(20);
        team_text.affix_ui();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.movement_x = pointer.x;
            this.movement_y = pointer.y;
        });

        this.socket.on('deployment-started', (deployment_payload: any) => {
            if (this.state !== CombatState.CREATED) return;
            this.state = CombatState.DEPLOYMENT_STARTED;

            this.deploy_max = deployment_payload.deployment_max;
            const deployment_tiles: Array<Vector> = deployment_payload.deployment_tiles;
            this.begin_deployment(deployment_tiles);
        });

        this.socket.on('battle-started', (payload: any) => {
            if (this.state !== CombatState.DEPLOYMENT_COMPLETE) return;
            this.state = CombatState.BATTLE_STARTED;

            for (const entity of this.stage.battle.get_entities()) {
                entity.get('sprite').destroy();
            }
            this.stage = null;

            this.stage = Stage.fromJSON(JSON.parse(payload.stage));
            this.begin_battle();
        });

        this.socket.on('post-tick', (data: any) => {
            if (this.state !== CombatState.BATTLE_STARTED) return;

            const turn_json: any = data.turn;
            this.stage.battle.deserialize_turn(turn_json);

            this.scene_context.renderer.render_turn(this.stage.battle.get_last_turn());
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
                if (this.ready_stat_text.text !== this.players_ready_string) this.ready_stat_text.text = this.players_ready_string;
                if (this.deploy_stat_text.text !== this.units_deployed_string) this.deploy_stat_text.text = this.units_deployed_string;
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
        this.deploy_ui = this.renderer.add_group();
        this.deploy_count = 0;

        this.ready_stat_text = this.renderer.add_text(this.renderer.width - this.renderer.buffer, this.renderer.buffer, 'Players Ready: ' + 0 + ' / ' + 2, this.deploy_ui);
        this.ready_stat_text.set_font_size(20);
        this.ready_stat_text.affix_ui();
        this.ready_stat_text.set_anchor(1, 0);

        this.deploy_stat_text = this.renderer.add_text(this.ready_stat_text.x, this.ready_stat_text.y + this.ready_stat_text.height + this.renderer.buffer, 'Units Deployed: ' + this.deploy_count + ' / ' + this.deploy_max, this.deploy_ui);
        this.deploy_stat_text.set_font_size(20);
        this.deploy_stat_text.affix_ui();
        this.deploy_stat_text.set_anchor(1, 0);

        for (const deployment_tile of deployment_tiles) {
            const world: Vector = this.renderer.local_to_world(deployment_tile);
            const tile_sprite: AbstractSprite = this.renderer.add_sprite(world.x, world.y, 'deploy_tile', this.deploy_ui);
            tile_sprite.set_scale(this.renderer.tile_scalar, this.renderer.tile_scalar);
            tile_sprite.set_anchor(0.5, 0.25);
        }

        const unit_frame: AbstractSprite = this.renderer.add_sprite(this.renderer.width, this.renderer.height, 'unit_frame', this.deploy_ui);
        unit_frame.set_scale(this.renderer.unit_scalar, this.renderer.unit_scalar);
        unit_frame.set_anchor(1, 1);
        unit_frame.set_position(unit_frame.x, unit_frame.y - (unit_frame.height / 2));
        unit_frame.affix_ui();

        const class_keys: Array<string> = ['sword_unit', 'spear_unit', 'bow_unit'];

        let index: number = 0;
        for (const class_key of class_keys) {
            const sprite: AbstractSprite = this.renderer.add_sprite(unit_frame.x, unit_frame.y - (unit_frame.height / 2), class_key, this.deploy_ui);
            sprite.set_frame(this.team === 0 ? 1 : 10);
            sprite.set_scale(this.renderer.unit_scalar, this.renderer.unit_scalar);
            sprite.set_anchor(1, 0.5);
            sprite.set_position(sprite.x - (((sprite.width + this.renderer.buffer) * index) + sprite.width / 2), sprite.y);
            sprite.affix_ui();

            sprite.on('pointerdown', () => {
                if (this.deploy_count >= this.deploy_max) return;

                this.deploy_class = class_key;

                if (this.deploy_unit) {
                    this.deploy_unit.destroy();
                    this.deploy_unit = null;
                }
                this.deploy_unit = this.renderer.add_sprite(0, 0, this.deploy_class, this.deploy_ui);
                this.deploy_unit.set_scale(this.renderer.unit_scalar, this.renderer.unit_scalar);
                this.deploy_unit.set_anchor(0.5, 1);
                this.deploy_unit.set_visible(false);

                if (this.team === 0) {
                    this.deploy_unit.play('idle_backward_' + this.deploy_class + '_blue');
                    this.deploy_unit.framework_object.flipX = true;
                } else {
                    this.deploy_unit.play('idle_forward_' + this.deploy_class + '_red');
                }
            }, this);

            index++;
        }

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.deploy_class) return;

            this.deploy_position = null;

            const local_pos: Vector = this.renderer.world_to_local(new Vector(pointer.worldX, pointer.worldY));
            if (!this.renderer.local_within_specific(local_pos, deployment_tiles)) {
                this.deploy_unit.set_visible(false);
                return;
            }

            if (this.stage.get_entity_by_position(local_pos)) {
                this.deploy_unit.set_visible(false);
                return;
            }

            this.deploy_position = new Vector(local_pos.x, local_pos.y);
            const world_pos: Vector = this.renderer.local_to_world(local_pos);
            this.deploy_unit.set_position(world_pos.x, world_pos.y + this.renderer.entity_adjust_y);
            this.deploy_unit.set_visible(true);
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

            this.clear_deployment();
        });

        this.ready_btn = this.renderer.add_sprite(this.renderer.center_x, this.renderer.height, 'generic_btn');
        this.ready_btn.set_scale(2, 2);
        this.ready_btn.set_position(this.ready_btn.x, this.ready_btn.y - (this.ready_btn.height * 2));
        this.ready_btn.affix_ui();

        this.ready_text = this.renderer.add_text(this.ready_btn.x, this.ready_btn.y, 'Ready');
        this.ready_text.set_font_size(36);
        this.ready_text.set_anchor(0.5, 0.5);
        this.ready_text.affix_ui();

        this.ready_btn.once('pointerup', () => {
            this.state = CombatState.DEPLOYMENT_COMPLETE;
            this.ready_packet();
        }, this);
    }

    private clear_deployment(): void {
        this.deploy_position = null;
        this.deploy_class = null;
        if (this.deploy_unit) {
            this.deploy_unit.destroy();
            this.deploy_unit = null;
        }
    }

    private begin_battle(): void {
        this.ready_btn.destroy();
        this.ready_text.destroy();

        this.renderer.render_entities(this.stage);
        this.deploy_ui.destroy();
        this.deploy_ui = null;
        this.input.removeAllListeners();
        this.init_input();
    }

    private init_input(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.movement_x = pointer.x;
            this.movement_y = pointer.y;

            for (const entity of this.stage.entities) {
                if (this.game.input.hitTest(pointer, [entity.get('sprite').framework_object], this.renderer.camera).length) {
                    this.movement_entity = entity;
                    return;
                }
            }
        }, this);

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.movement_entity) return;
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

            this.renderer.camera.setScroll(this.renderer.camera.scrollX + scroll_x, this.renderer.camera.scrollY + scroll_y);
        }, this);
    }
}