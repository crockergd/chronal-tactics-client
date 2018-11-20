import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractContainer from '../abstracts/abstractcontainer';
import Vector from '../utils/vector';
import { Textures } from 'phaser';
import Stage from '../stages/stage';
import { Resoluble, Move, Attack, Death, Face, Entity } from 'turn-based-combat-framework';
import AbstractGroup from '../abstracts/abstractgroup';

export default class RenderContext {
    public scene: AbstractScene;
    public container: AbstractContainer;
    public tile_width: number;
    public tile_height: number;
    public ui_camera: Phaser.Cameras.Scene2D.Camera;

    public get buffer(): number {
        return 10;
    }

    public get width(): number {
        return this.camera.displayWidth;
    }

    public get height(): number {
        return this.camera.displayHeight;
    }

    public get center_x(): number {
        return this.camera.centerX;
    }

    public get center_y(): number {
        return this.camera.centerY;
    }
    
    public get camera(): Phaser.Cameras.Scene2D.Camera {
        return this.scene.cameras.main;
    }

    public get entity_adjust_y(): number {
        return 15;
    }

    constructor() {
        
    }

    public render_turn(resolubles: Array<Resoluble>): void {
        const faces: Array<Face> = resolubles.filter(resoluble => resoluble.type === 'Face') as any;
        for (const resoluble of faces) {
            this.update_entity_facing(resoluble.source);
        }

        const movements: Array<Move> = resolubles.filter(resoluble => resoluble.type === 'Move') as any;
        for (const resoluble of movements) {
            const position: Vector = this.local_to_world(resoluble.source.spatial.position);
            position.y += this.entity_adjust_y;
            resoluble.source.get('sprite').set_position(position.x, position.y);
        }

        const attacks: Array<Attack> = resolubles.filter(resoluble => resoluble.type === 'Attack') as any;
        for (const resoluble of attacks) {
            for (const position of (resoluble as any).targetted_positions) {
                this.render_effect('attack_effect', (position as any));
            }
        }

        const deaths: Array<Death> = resolubles.filter(resoluble => resoluble.type === 'Death') as any;
        for (const resoluble of deaths) {
            let animation_key: string = 'death';
            animation_key += '_' + resoluble.target.identifier.class_key;
            animation_key += resoluble.target.team === 0 ? '_blue' : '_red';

            resoluble.target.get('sprite').framework_object.play(animation_key);
        }
    }

    public update_entity_facing(entity: Entity): void {
        if (!entity.alive) {
            return;
        }

        let animation_key: string;

        if (entity.spatial.facing.y < 0) {
            animation_key = 'idle_backward';
        } else {
            animation_key = 'idle_forward';
        }

        animation_key += '_' + entity.identifier.class_key;
        animation_key += entity.team === 0 ? '_blue' : '_red';

        entity.get('sprite').framework_object.play(animation_key);

        if (entity.spatial.facing.x < 0) {
            entity.get('sprite').framework_object.flipX = false;
        } else {
            entity.get('sprite').framework_object.flipX = true;
        }
    }

    public render_effect(effect_key: string, position: Vector): void {
        const sprite_position: Vector = this.local_to_world(position);
        const sprite: AbstractSprite = this.add_sprite(sprite_position.x, sprite_position.y, effect_key);
        sprite.set_anchor(0.5, 1);
        sprite.framework_object.play('attack').on('animationcomplete', (animation: any, animation_frame: any, sprite: Phaser.GameObjects.Sprite) => {
            sprite.destroy();
        });
    }

    public render_stage(stage: Stage): void {
        this.container = this.add_container(0, 0);

        const tile_key: string = 'base_tile';
        const tile_scale_factor: number = 6;

        const tile_dimensions: Vector = this.get_sprite_dimensions(tile_key);
        tile_dimensions.x *= tile_scale_factor;
        tile_dimensions.y *= tile_scale_factor;
        this.tile_width = (tile_dimensions.x / 2);
        this.tile_height = (tile_dimensions.y / 4) + 3;

        for (let i: number = stage.width - 1; i >= 0; i--) {
            for (let j: number = 0; j < stage.height; j++) {
                const position: Vector = this.local_to_world(new Vector(i, j));

                stage.grid[i][j].sprite = this.add_sprite(position.x, position.y, tile_key, this.container);
                stage.grid[i][j].sprite.set_anchor(0.5, 0.25);
                stage.grid[i][j].sprite.set_scale(tile_scale_factor, tile_scale_factor);
            }
        }

        this.container.set_position(this.container.x + tile_dimensions.x, this.container.y + tile_dimensions.y * stage.height / 2);

        const center_world: Vector = this.local_to_world(stage.get_center());
        this.camera.centerOn(center_world.x, center_world.y);

        // let bounds_x: number = 0;
        // let bounds_y: number = 0;
        // const bounds_width: number = (tile_dimensions.x * 2) + (center_stage_x * 2);
        // const bounds_height: number = (tile_dimensions.y * 2) + (center_stage_y * 2);

        // if (this.scene.cameras.main.width > bounds_width) {
        //     bounds_x = -((this.scene.cameras.main.width - bounds_width) / 2);
        // }
        // if (this.scene.cameras.main.height > bounds_height) {
        //     bounds_y = -((this.scene.cameras.main.height - bounds_height) / 2);
        // }

        // this.scene.cameras.main.setBounds(bounds_x, bounds_y, bounds_width, bounds_height);
    }

    public render_entities(stage: Stage): void {
        for (const entity of stage.entities) {
            if (entity.get('sprite')) continue;

            const position: Vector = this.local_to_world(entity.spatial.position);
            position.y += this.entity_adjust_y;

            entity.set('sprite', this.add_sprite(position.x, position.y, entity.identifier.class_key), false);
            entity.get('sprite').set_anchor(0.5, 1.0);
            entity.get('sprite').framework_object.setInteractive();
            entity.set('dirty', true);
            entity.get('sprite').set_scale(4, 4);
            this.update_entity_facing(entity);
        }
    }

    public add_container(x: number, y: number): AbstractContainer {
        const container: AbstractContainer = new AbstractContainer(this, this.scene, x, y);

        return container;
    }

    public add_group(): AbstractGroup {
        const group: AbstractGroup = new AbstractGroup(this, this.scene);

        return group;
    }

    public add_sprite(x: number, y: number, key: string, container?: AbstractContainer | AbstractGroup): AbstractSprite {
        const sprite: AbstractSprite = new AbstractSprite(this, this.scene, x, y, key, container);

        return sprite;
    }

    public add_text(x: number, y: number, text: string, container?: AbstractContainer | AbstractGroup): AbstractText {
        const render_text: AbstractText = new AbstractText(this, this.scene, x, y, text, container);

        return render_text;
    }

    public get_sprite_dimensions(key: string): Vector {
        const sprite: Textures.Frame = this.scene.textures.getFrame(key);

        return new Vector(sprite.width, sprite.height);
    }

    public local_to_world(local: Vector): Vector {
        const world: Vector = new Vector(local.x, local.y);

        world.x *= this.tile_width;
        world.x += local.y * this.tile_width;
        world.y *= this.tile_height;
        world.y -= local.x * this.tile_height;

        world.x += this.container.x;
        world.y += this.container.y;

        return new Vector(world.x, world.y);
    }

    public world_to_local(world: Vector): Vector {
        const local: Vector = new Vector(world.x, world.y);
        local.x -= this.container.x;
        local.y -= this.container.y;

        local.x /= this.tile_width * 2;
        local.x -= (world.y - this.container.y) / this.tile_width;

        local.y /= this.tile_height;
        local.y += (world.x - this.container.x) / (this.tile_height * 2);
        local.y /= 2;

        return new Vector(Math.round(local.x), Math.round(local.y));
    }

    public local_within_bounds(local: Vector, stage: Stage): boolean {
        if (local.x < 0) return false;
        if (local.y < 0) return false;
        if (local.x > stage.width - 1) return false;
        if (local.y > stage.height - 1) return false;

        return true;
    }
}