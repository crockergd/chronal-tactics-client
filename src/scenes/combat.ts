import { Battle, TickMode } from 'turn-based-combat-framework';
import Entity from '../entities/entity';
import Stage from '../stages/stage';
import Vector from '../utils/vector';
import AbstractScene from '../abstracts/abstractscene';
import AbstractSprite from '../abstracts/abstractsprite';
import Cell from '../stages/cell';

export default class Combat extends AbstractScene {
    private battle: Battle;
    private stage: Stage;

    private pointer_x: number;
    private pointer_y: number;

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
        this.scene_context.renderer.render_entities(this.stage);
        // this.render_entities();

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {     
            this.pointer_x = pointer.x;
            this.pointer_y = pointer.y;
            
            // player.spatial.position.y++;
            // player.renderable.dirty = true;
        }, this);

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (Math.abs(pointer.x - this.pointer_x) < 30) return;
            if (Math.abs(pointer.y - this.pointer_y) < 30) return;

            if (pointer.x > this.pointer_x) {
                player.spatial.facing.x = 1;
            } else {
                player.spatial.facing.x = -1;
            }

            if (pointer.y > this.pointer_y) {
                player.spatial.facing.y = 1;
            } else {
                player.spatial.facing.y = -1;
            }            

            player.move();
        }, this);
    }

    public update(time: number, dt_ms: number): void {
        const dt: number = dt_ms / 1000;
        this.battle.update(dt);
        this.scene_context.renderer.update(this.stage);
    }

    public render(): void {
        this.scene_context.renderer.render(this.stage);
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

    public render_entities(): void {
        const cell: Cell = this.stage.grid[3][3];
        const sprite: AbstractSprite = this.scene_context.renderer.add_sprite(this.stage.container.x + cell.sprite.x, this.stage.container.y + cell.sprite.y, 'bandit');

        this.cameras.main.startFollow(sprite.framework_object);
        this.cameras.main.stopFollow();
    }
}