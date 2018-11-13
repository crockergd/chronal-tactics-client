import { Battle, TickMode, Turn } from 'turn-based-combat-framework';
import Entity from '../entities/entity';
import Stage from '../stages/stage';
import Vector from '../utils/vector';
import AbstractScene from '../abstracts/abstractscene';
import Move from '../resolubles/move';
import Team from '../entities/team';
import Attack from '../resolubles/attack';

// get tbcf working a little bit, enough to add a custom resoluble to move entities

export default class Combat extends AbstractScene {
    private battle: Battle;
    private stage: Stage;
    private turn_time: number;

    private movement_entity: Entity;
    private movement_x: number;
    private movement_y: number;

    public create(): void {
        this.battle = new Battle(TickMode.SYNC);
        this.stage = new Stage(5, 5, 1);

        // const bandit_a: Entity = new Entity('bandit', Team.PLAYERS, new Vector(0, 1, 0));
        const bandit_b: Entity = new Entity('bandit', Team.PLAYERS, new Vector(0, 3, 0));
        const spear_a: Entity = new Entity('spearman', Team.PLAYERS, new Vector(0, 1, 0));
        // const spear_b: Entity = new Entity('spearman', Team.PLAYERS, new Vector(0, 4, 0));

        const enemy: Entity = new Entity('bandit', Team.ENEMIES, new Vector(3, 2, 0));

        // this.stage.add_entity(bandit_a);
        this.stage.add_entity(bandit_b);
        this.stage.add_entity(spear_a);
        // this.stage.add_entity(spear_b);
        this.stage.add_entity(enemy);

        for (const entity of this.stage.entities) {
            this.battle.add_entity(entity);
        }

        this.render_stage();
        this.scene_context.renderer.initiate_battle(this.stage);
        // this.render_entities();

        this.battle.register_pre_tick_callback(this.on_pre_tick, this);
        this.battle.register_post_tick_callback(this.on_post_tick, this);
        this.battle.register_resoluble(Move);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            for (const entity of this.stage.entities) {
                if (entity.identifier.team !== Team.PLAYERS) continue;

                if (this.game.input.hitTest(pointer, [entity.renderable.sprite.framework_object], this.cameras.main).length) {
                    this.movement_entity = entity;

                    this.movement_x = pointer.x;
                    this.movement_y = pointer.y;

                    return;
                }
            }

            // player.spatial.position.y++;
            // player.renderable.dirty = true;
        }, this);

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.movement_entity) return;
            if (Math.abs(pointer.x - this.movement_x) < 30) return;
            if (Math.abs(pointer.y - this.movement_y) < 30) return;

            if (pointer.x > this.movement_x) {
                this.movement_entity.spatial.facing.x = 1;
            } else {
                this.movement_entity.spatial.facing.x = -1;
            }

            if (pointer.y > this.movement_y) {
                this.movement_entity.spatial.facing.y = 1;
            } else {
                this.movement_entity.spatial.facing.y = -1;
            }

            if (!this.movement_entity.spatial.has_moved) {
                // this.battle.add_delayed_resoluble(new Move(this.movement_entity));
                this.battle.call_resoluble('Move', true, this.movement_entity);
                this.movement_entity.spatial.has_moved = true;
            }

            // this.battle.add_delayed_resoluble(null);

            this.movement_entity = null;
        }, this);
    }

    public update(time: number, dt_ms: number): void {
        const dt: number = dt_ms / 1000;
        this.battle.update(dt);
        this.stage.turn_remaining = this.battle.turn_remaining;
        this.scene_context.renderer.update(this.stage);
        this.scene_context.renderer.render(this.stage);
    }

    public on_pre_tick(): void {
        // console.log('fweawe');

        for (const entity of this.stage.entities) {
            this.battle.add_delayed_resoluble(new Attack(entity, this.stage));

            entity.spatial.has_moved = false;
        }
    }

    public on_post_tick(turn: Turn): void {
        this.scene_context.renderer.post_tick(this.stage, turn);
    }

    public render_stage(): void {
        this.stage.container = this.scene_context.renderer.add_container(this.cameras.main.centerX, this.cameras.main.centerY);

        const tile_dimensions: Vector = this.scene_context.renderer.get_sprite_dimensions('dirt');
        this.stage.tile_width = tile_dimensions.x / 2.0;
        this.stage.tile_height = (tile_dimensions.y / 2.0) - 5;

        for (let i: number = this.stage.width - 1; i >= 0; i--) {
            for (let j: number = 0; j < this.stage.height; j++) {
                this.stage.grid[i][j].sprite = this.scene_context.renderer.add_sprite(i * this.stage.tile_width + (j * this.stage.tile_width), (j * this.stage.tile_height) - (i * this.stage.tile_height), 'dirt', this.stage.container);
            }
        }

        this.cameras.main.centerOn(this.stage.container.x + this.stage.grid[2][2].sprite.x, this.stage.container.y + this.stage.grid[2][2].sprite.y);
    }

    // public render_entities(): void {
    //     const cell: Cell = this.stage.grid[3][3];
    //     const sprite: AbstractSprite = this.scene_context.renderer.add_sprite(this.stage.container.x + cell.sprite.x, this.stage.container.y + cell.sprite.y, 'bandit');

    //     this.cameras.main.startFollow(sprite.framework_object);
    //     this.cameras.main.stopFollow();
    // }
}