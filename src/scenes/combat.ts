import { Entity } from 'turn-based-combat-framework';
import Stage from '../stages/stage';
import Vector from '../utils/vector';
import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';

export default class Combat extends AbstractScene {
    private stage: Stage;
    private team: number;

    private movement_entity: Entity;
    private movement_x: number;
    private movement_y: number;

    private deploy_class: string;
    private deploy_position: Vector;

    private deploy_tile: AbstractSprite;

    // server is preventing units from moving to a space a unit is in, even if unit is leaving that turn
    // revisit stage centering code and camera bounds, probably have it center on your side on the middle of your team

    public create(): void {
        this.socket.once('room-closed', () => {
            this.socket.off('post-tick');

            this.scene.start('lobby', {
                scene_context: this.scene_context,
                socket: this.socket
            });
        });

        this.team = this.combat_data.team;
        this.stage = Stage.fromJSON(JSON.parse(this.combat_data.stage));

        this.renderer.render_stage(this.stage);
        this.scene_context.renderer.render_entities(this.stage); // prob remove

        const name_text: AbstractText = this.renderer.add_text(this.renderer.buffer, this.renderer.buffer, this.settings.name);
        name_text.set_font_size(28);
        name_text.framework_object.setScrollFactor(0, 0);

        const team_text: AbstractText = this.renderer.add_text(name_text.x, name_text.y + name_text.height + this.renderer.buffer, 'Team ' + (this.team === 0 ? 'Blue' : 'Red'));
        team_text.set_font_size(20);
        team_text.framework_object.setScrollFactor(0, 0);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.movement_x = pointer.x;
            this.movement_y = pointer.y;
        });

        // this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
        //     if (!pointer.isDown) return;
        //     if (this.movement_entity) return;

        //     const scroll_x: number = (this.movement_x - pointer.x) / 2;
        //     const scroll_y: number = (this.movement_y - pointer.y) / 2;

        //     this.movement_x = pointer.x;
        //     this.movement_y = pointer.y;

        //     this.cameras.main.setScroll(this.cameras.main.scrollX + scroll_x, this.cameras.main.scrollY + scroll_y);
        // }, this);

        this.socket.emit('deployment-ready');
        this.socket.once('deployment-started', () => {
            this.begin_deployment();
        });
    }

    public fire_resoluble(key: string, ...args: any[]): void {
        const resoluble: any = this.stage.battle.serialize_resoluble(key, ...args);
        this.socket.emit('resoluble', {
            resoluble: resoluble
        });
    }

    private begin_deployment(): void {
        const class_keys: Array<string> = ['sword_unit', 'spear_unit'];

        this.deploy_tile = this.renderer.add_sprite(0, 0, 'deploy_tile');
        this.deploy_tile.set_scale(6, 6);
        this.deploy_tile.set_anchor(0.5, 0.25);
        this.deploy_tile.set_visible(false);

        let index: number = 0;
        for (const class_key of class_keys) {
            const sprite: AbstractSprite = this.renderer.add_sprite(this.renderer.width - (100 * index), this.renderer.height, class_key);
            sprite.set_frame(1);
            sprite.set_scale(4, 4);
            sprite.set_anchor(1, 1);
            sprite.framework_object.setScrollFactor(0, 0);

            sprite.on('pointerdown', () => {
                this.deploy_class = class_key;
            }, this);

            index++;
        }

        this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (!this.deploy_class) return;

            this.deploy_position = null;

            const local_pos: Vector = this.renderer.world_to_local(new Vector(pointer.worldX, pointer.worldY));
            if (!this.renderer.local_within_bounds(local_pos, this.stage)) {
                this.deploy_tile.set_visible(false);
                return;
            }

            this.deploy_position = new Vector(local_pos.x, local_pos.y);
            const world_pos: Vector = this.renderer.local_to_world(local_pos);
            this.deploy_tile.set_position(world_pos.x, world_pos.y);
            this.deploy_tile.set_visible(true);
        }, this);

        this.input.on('pointerup', () => {
            if (!this.deploy_class || !this.deploy_position) {
                this.deploy_tile.set_visible(false);
                this.deploy_position = null;
                this.deploy_class = null;
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

            this.renderer.render_entities(this.stage);

            this.deploy_tile.set_visible(false);
            this.deploy_position = null;
            this.deploy_class = null;
        });

        const ready_btn: AbstractSprite = this.renderer.add_sprite(this.renderer.center_x, this.renderer.height, 'generic_btn');
        ready_btn.set_scale(2.0, 2.0);
        ready_btn.set_position(ready_btn.x, ready_btn.y - (ready_btn.height * 3));
        ready_btn.affix_ui();

        const ready_text: AbstractText = this.renderer.add_text(ready_btn.x, ready_btn.y, 'Ready');
        ready_text.set_font_size(36);
        ready_text.set_origin(0.5, 0.5);
        ready_text.affix_ui();

        ready_btn.on('pointerup', () => {
            const entities: Array<Entity> = this.stage.battle.get_entities();

            this.socket.emit('deployment-complete', {
                entities: entities.map((entity: Entity) => {
                    return [entity.identifier.class_key, entity.spatial.position];
                })
            });

            ready_btn.destroy();
            ready_text.destroy();

            this.socket.once('battle-started', (payload: any) => {
                for (const entity of this.stage.battle.get_entities()) {
                    entity.get('sprite').destroy();
                }

                this.stage = Stage.fromJSON(JSON.parse(payload.stage));
                this.begin_battle();
            });
        });
    }

    private begin_battle(): void {
        this.renderer.render_entities(this.stage);
        this.input.removeAllListeners();
        this.init_input();

        this.socket.on('post-tick', (data: any) => {
            const turn_json: any = data.turn;
            this.stage.battle.deserialize_turn(turn_json);

            this.scene_context.renderer.render_turn(this.stage.battle.get_last_turn());
        });
    }

    private init_input(): void {
        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            this.movement_x = pointer.x;
            this.movement_y = pointer.y;

            for (const entity of this.stage.entities) {
                if (this.game.input.hitTest(pointer, [entity.get('sprite').framework_object], this.cameras.main).length) {
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

            this.cameras.main.setScroll(this.cameras.main.scrollX + scroll_x, this.cameras.main.scrollY + scroll_y);
        }, this);
    }
}