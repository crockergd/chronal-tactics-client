import { Entity } from 'turn-based-combat-framework';
import Stage from '../stages/stage';
import Vector from '../utils/vector';
import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';

export default class Combat extends AbstractScene {
    private stage: Stage;
    private team: number;

    private movement_entity: Entity;
    private movement_x: number;
    private movement_y: number;

    // add a way to tell which direction a unit is moving

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

        const name_text: AbstractText = this.renderer.add_text(this.renderer.buffer, this.renderer.buffer, this.settings.name);
        name_text.set_font_size(28);
        name_text.framework_object.setScrollFactor(0, 0);
        
        const team_text: AbstractText = this.renderer.add_text(name_text.x, name_text.y + name_text.height + this.renderer.buffer, this.team === 0 ? 'Blue' : 'Red');
        team_text.set_font_size(20);
        team_text.framework_object.setScrollFactor(0, 0);

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
        this.scene_context.renderer.container = this.scene_context.renderer.add_container(0, 0);

        const tile_dimensions: Vector = this.scene_context.renderer.get_sprite_dimensions('dirt');
        this.scene_context.renderer.tile_width = tile_dimensions.x / 2.0 + 3;
        this.scene_context.renderer.tile_height = (tile_dimensions.y / 2.0) - 5 + 3;

        for (let i: number = this.stage.width - 1; i >= 0; i--) {
            for (let j: number = 0; j < this.stage.height; j++) {
                this.stage.grid[i][j].sprite = this.scene_context.renderer.add_sprite(i * this.scene_context.renderer.tile_width + (j * this.scene_context.renderer.tile_width), (j * this.scene_context.renderer.tile_height) - (i * this.scene_context.renderer.tile_height), 'dirt', this.scene_context.renderer.container);

            }
        }

        this.renderer.container.set_position(this.renderer.container.x + tile_dimensions.x, this.renderer.container.y + (this.renderer.tile_height * this.stage.height) - this.renderer.tile_height + tile_dimensions.y);
        const center_stage_x: number = ((tile_dimensions.x * this.stage.width) / 2);
        const center_stage_y: number = ((tile_dimensions.y * this.stage.height) / 2) - this.renderer.tile_height;
        this.cameras.main.centerOn(tile_dimensions.x + center_stage_x, tile_dimensions.y + center_stage_y);

        let bounds_x: number = 0;
        let bounds_y: number = 0;
        const bounds_width: number = (tile_dimensions.x * 2) + (center_stage_x * 2);
        const bounds_height: number = (tile_dimensions.y * 2) + (center_stage_y * 2);

        if (this.cameras.main.width > bounds_width) {
            bounds_x = -((this.cameras.main.width - bounds_width) / 2);
        }
        if (this.cameras.main.height > bounds_height) {
            bounds_y = -((this.cameras.main.height - bounds_height) / 2);
        }

        this.cameras.main.setBounds(bounds_x, bounds_y, bounds_width, bounds_height);
    }
}