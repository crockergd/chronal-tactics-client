import { Battle, TickMode } from 'turn-based-combat-framework';
import Entity from '../entities/entity';
import Stage from '../stages/stage';
import Vector from '../utils/vector';
import AbstractScene from '../abstracts/abstractscene';
import Move from '../resolubles/move';

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

        const player: Entity = new Entity('bandit');
        const enemy: Entity = new Entity('bandit');

        this.stage.add_entity(player);
        this.stage.add_entity(enemy);

        for (const entity of this.stage.entities) {
            this.battle.add_entity(entity);
        }

        player.spatial.position = new Vector(0, 0, 0);
        enemy.spatial.position = new Vector(1, 1, 0);

        this.render_stage();
        this.scene_context.renderer.initiate_battle(this.stage);
        // this.render_entities();

        this.battle.register_tick_callback(this.on_tick, this);

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            for (const entity of this.stage.entities) {
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
                this.battle.add_delayed_resoluble(new Move(this.movement_entity));
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

    public on_tick(): void {
        // console.log('fweawe');

        for (const entity of this.stage.entities) {
            entity.spatial.has_moved = false;
        }
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
    }

    // public render_entities(): void {
    //     const cell: Cell = this.stage.grid[3][3];
    //     const sprite: AbstractSprite = this.scene_context.renderer.add_sprite(this.stage.container.x + cell.sprite.x, this.stage.container.y + cell.sprite.y, 'bandit');

    //     this.cameras.main.startFollow(sprite.framework_object);
    //     this.cameras.main.stopFollow();
    // }
}