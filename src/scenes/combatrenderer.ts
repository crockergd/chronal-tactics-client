import RenderContext from '../contexts/rendercontext';
import Stage from '../stages/stage';
import { Vector, Resoluble, Face, Move, Attack, Death, Entity } from 'turn-based-combat-framework';
import AbstractContainer from '../abstracts/abstractcontainer';
import AbstractText from '../abstracts/abstracttext';
import ClientSettings from '../utils/clientsettings';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractGroup from '../abstracts/abstractgroup';

export default class CombatRenderer {
    public container: AbstractContainer;
    public tile_width: number;
    public tile_height: number;
    
    public deploy_ui: AbstractGroup;
    public deploy_unit: AbstractSprite;
    public deploy_classes: Array<AbstractSprite>;
    public deploy_stat_text: AbstractText;    
    public ready_stat_text: AbstractText;
    public ready_btn: AbstractSprite;
    public ready_text: AbstractText;
    public timer_text: AbstractText;

    public get entity_adjust_y(): number {
        return 15;
    }

    public get unit_scalar(): number {
        return 4;
    }

    public get tile_scalar(): number {
        return 6;
    }

    public get unit_depth(): number {
        return 2;
    }

    public get facing_depth(): number {
        return 1;
    }

    constructor(private readonly render_context: RenderContext, private readonly settings: ClientSettings) {
        this.deploy_classes = new Array<AbstractSprite>();
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
                const world: Vector = this.local_to_world(position);
                this.render_context.render_effect('attack_effect', world);
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


    public render_stage(stage: Stage): void {
        this.container = this.render_context.add_container(0, 0);

        const tile_key: string = 'base_tile';

        const tile_dimensions: Vector = this.render_context.get_sprite_dimensions(tile_key);
        tile_dimensions.x *= this.tile_scalar;
        tile_dimensions.y *= this.tile_scalar;
        this.tile_width = (tile_dimensions.x / 2);
        this.tile_height = (tile_dimensions.y / 4) + 3;

        for (let i: number = stage.width - 1; i >= 0; i--) {
            for (let j: number = 0; j < stage.height; j++) {
                const position: Vector = this.local_to_world(new Vector(i, j));

                stage.grid[i][j].sprite = this.render_context.add_sprite(position.x, position.y, tile_key, this.container);
                stage.grid[i][j].sprite.set_anchor(0.5, 0.25);
                stage.grid[i][j].sprite.set_scale(this.tile_scalar, this.tile_scalar);
            }
        }

        this.container.set_position(this.container.x + tile_dimensions.x, this.container.y + tile_dimensions.y * stage.height / 2);

        const center_world: Vector = this.local_to_world(stage.get_center());
        this.render_context.camera.centerOn(center_world.x, center_world.y);

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

            entity.set('sprite', this.render_context.add_sprite(position.x, position.y, entity.identifier.class_key), false);
            entity.get('sprite').set_anchor(0.5, 1.0);
            entity.get('sprite').framework_object.setInteractive();
            entity.get('sprite').set_depth(this.unit_depth);
            entity.set('dirty', true);
            entity.get('sprite').set_scale(this.unit_scalar, this.unit_scalar);
            this.update_entity_facing(entity);
        }
    }

    public render_team_ui(): void {
        const is_blue: boolean = this.settings.team === 0;
        const title_size: number = 28;
        const subtitle_size: number = 20;

        const blue_name_text: AbstractText = this.render_context.add_text(this.render_context.buffer, this.render_context.buffer, is_blue ? this.settings.name : this.settings.opponent);
        blue_name_text.set_font_size(title_size);
        blue_name_text.affix_ui();
        const blue_team_text: AbstractText = this.render_context.add_text(blue_name_text.x, blue_name_text.y + blue_name_text.height + this.render_context.buffer, is_blue ? 'YOU' : 'OPPONENT');
        blue_team_text.set_font_size(subtitle_size);
        blue_team_text.affix_ui();

        const red_name_text: AbstractText = this.render_context.add_text(this.render_context.width - this.render_context.buffer, this.render_context.buffer, is_blue ? this.settings.opponent : this.settings.name);
        red_name_text.set_font_size(title_size);
        red_name_text.set_anchor(1, 0);
        red_name_text.affix_ui();
        const red_team_text: AbstractText = this.render_context.add_text(red_name_text.x, red_name_text.y + red_name_text.height + this.render_context.buffer, is_blue ? 'OPPONENT' : 'YOU');
        red_team_text.set_font_size(subtitle_size);
        red_team_text.set_anchor(1, 0);
        red_team_text.affix_ui();
    }

    public render_deployment_ui(deployment_tiles: Array<Vector>): void {
        this.deploy_ui = this.render_context.add_group();

        for (const deployment_tile of deployment_tiles) {
            const world: Vector = this.local_to_world(deployment_tile);
            const tile_sprite: AbstractSprite = this.render_context.add_sprite(world.x, world.y, 'deploy_tile', this.deploy_ui);
            tile_sprite.set_scale(this.tile_scalar, this.tile_scalar);
            tile_sprite.set_anchor(0.5, 0.25);
        }

        const unit_frame: AbstractSprite = this.render_context.add_sprite(this.render_context.width, this.render_context.height, 'unit_frame', this.deploy_ui);
        unit_frame.set_scale(this.unit_scalar, this.unit_scalar);
        unit_frame.set_anchor(1, 1);
        unit_frame.set_position(unit_frame.x, unit_frame.y - (unit_frame.height / 2));
        unit_frame.affix_ui();

        const class_keys: Array<string> = ['sword_unit', 'spear_unit', 'bow_unit'];

        let index: number = 0;
        for (const class_key of class_keys) {
            const sprite: AbstractSprite = this.render_context.add_sprite(unit_frame.x, unit_frame.y - (unit_frame.height / 2), class_key, this.deploy_ui);
            sprite.set_frame(this.settings.team === 0 ? 1 : 10);
            sprite.set_scale(this.unit_scalar, this.unit_scalar);
            sprite.set_anchor(1, 0.5);
            sprite.set_position(sprite.x - (((sprite.width + this.render_context.buffer) * index) + sprite.width / 2), sprite.y);
            sprite.affix_ui();

            this.deploy_classes.push(sprite);

            index++;
        }

        this.ready_stat_text = this.render_context.add_text(this.render_context.center_x, this.render_context.buffer, '', this.deploy_ui);
        this.ready_stat_text.set_font_size(20);
        this.ready_stat_text.affix_ui();
        this.ready_stat_text.set_anchor(0.5, 0);

        this.deploy_stat_text = this.render_context.add_text(this.ready_stat_text.x, this.ready_stat_text.y + this.ready_stat_text.height + this.render_context.buffer, '', this.deploy_ui);
        this.deploy_stat_text.set_font_size(20);
        this.deploy_stat_text.affix_ui();
        this.deploy_stat_text.set_anchor(0.5, 0);

        this.ready_btn = this.render_context.add_sprite(this.render_context.center_x, this.render_context.height, 'generic_btn');
        this.ready_btn.set_scale(2, 2);
        this.ready_btn.set_position(this.ready_btn.x, this.ready_btn.y - (this.ready_btn.height * 2));
        this.ready_btn.affix_ui();

        this.ready_text = this.render_context.add_text(this.ready_btn.x, this.ready_btn.y, 'Ready');
        this.ready_text.set_font_size(36);
        this.ready_text.set_anchor(0.5, 0.5);
        this.ready_text.affix_ui();
        
        const deployment_center: Vector = this.local_to_world(new Vector(this.settings.team === 0 ? 1 : 5, 3));
        this.render_context.camera.pan(deployment_center.x, deployment_center.y);
    }

    public render_deployment_unit(deployment_class: string): void {
        if (this.deploy_unit) {
            this.deploy_unit.destroy();
            this.deploy_unit = null;
        }
        this.deploy_unit = this.render_context.add_sprite(0, 0, deployment_class, this.deploy_ui);
        this.deploy_unit.set_scale(this.unit_scalar, this.unit_scalar);
        this.deploy_unit.set_anchor(0.5, 1);
        this.deploy_unit.set_visible(false);

        if (this.settings.team === 0) {
            this.deploy_unit.play('idle_backward_' + deployment_class + '_blue');
            this.deploy_unit.framework_object.flipX = true;
        } else {
            this.deploy_unit.play('idle_forward_' + deployment_class + '_red');
        }
    }

    public render_timer(timer: number, interval: number): void {
        if (!this.timer_text) {
            this.timer_text = this.render_context.add_text(this.render_context.center_x, this.render_context.buffer, '');
            this.timer_text.set_font_size(20);
            this.timer_text.set_anchor(0.5, 0);
            this.timer_text.affix_ui();
        }

        this.timer_text.text = timer.toFixed(2);
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

    public local_within_specific(local: Vector, tiles: Array<Vector>): boolean {
        for (const tile of tiles) {
            if (local.x === tile.x && local.y === tile.y) return true;
        }

        return false;
    }
}