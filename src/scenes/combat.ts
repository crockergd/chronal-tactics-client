import { Turn, Entity } from 'turn-based-combat-framework';
import Stage from '../stages/stage';
import Vector from '../utils/vector';
import AbstractScene from '../abstracts/abstractscene';

export default class Combat extends AbstractScene {
    private stage: Stage;
    private team: number;

    private movement_entity: Entity;
    private movement_x: number;
    private movement_y: number;
    
    // add match complete emit
    // add a way to distinguish teams

    public create(): void {
        this.team = this.combat_data.team;
        this.stage = Stage.fromJSON(JSON.parse(this.combat_data.stage));

        this.socket.once('room-closed', () => {
            this.socket.off('post-tick');

            this.scene.start('lobby', {
                scene_context: this.scene_context,
                socket: this.socket
            });
        });

        this.render_stage();
        this.scene_context.renderer.initiate_battle(this.stage);

        this.socket.on('post-tick', (data: any) => {
            const turn_json: any = data.turn;
            this.stage.battle.deserialize_turn(turn_json);

            this.scene_context.renderer.render_turn(this.stage.battle.get_last_turn());
        });

        this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
            for (const entity of this.stage.entities) {
                if (entity.identifier.team !== this.team) continue;

                if (this.game.input.hitTest(pointer, [entity.get('sprite').framework_object], this.cameras.main).length) {
                    this.movement_entity = entity;

                    this.movement_x = pointer.x;
                    this.movement_y = pointer.y;

                    return;
                }
            }
        }, this);

        this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
            if (!this.movement_entity) return;
            if (Math.abs(pointer.x - this.movement_x) < 30) return;
            if (Math.abs(pointer.y - this.movement_y) < 30) return;

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
    }

    public update(time: number, dt_ms: number): void {
        const dt: number = dt_ms / 1000;
        this.scene_context.renderer.update(this.stage);
    }

    public fire_resoluble(key: string, ...args: any[]): void {
        const resoluble: any = this.stage.battle.serialize_resoluble(key, ...args);
        this.socket.emit('resoluble', {
            resoluble: resoluble
        })
    }

    public render_stage(): void {
        this.scene_context.renderer.container = this.scene_context.renderer.add_container(this.cameras.main.centerX, this.cameras.main.centerY);

        const tile_dimensions: Vector = this.scene_context.renderer.get_sprite_dimensions('dirt');
        this.scene_context.renderer.tile_width = tile_dimensions.x / 2.0;
        this.scene_context.renderer.tile_height = (tile_dimensions.y / 2.0) - 5;

        for (let i: number = this.stage.width - 1; i >= 0; i--) {
            for (let j: number = 0; j < this.stage.height; j++) {
                this.stage.grid[i][j].sprite = this.scene_context.renderer.add_sprite(i * this.scene_context.renderer.tile_width + (j * this.scene_context.renderer.tile_width), (j * this.scene_context.renderer.tile_height) - (i * this.scene_context.renderer.tile_height), 'dirt', this.scene_context.renderer.container);
            }
        }

        this.cameras.main.centerOn(this.scene_context.renderer.container.x + this.stage.grid[2][2].sprite.x, this.scene_context.renderer.container.y + this.stage.grid[2][2].sprite.y);
    }
}