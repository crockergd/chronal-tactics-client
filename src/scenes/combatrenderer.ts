import RenderContext from '../contexts/rendercontext';
import Stage from '../stages/stage';
import { Vector, Resoluble, Face, Move, Attack, Death, Entity } from 'turn-based-combat-framework';
import AbstractText from '../abstracts/abstracttext';
import ClientSettings from '../utils/clientsettings';
import AbstractSprite from '../abstracts/abstractsprite';
import { AbstractType } from '../abstracts/abstracttype';
import AbstractGroup from '../abstracts/abstractgroup';
import AbstractButton from '../abstracts/abstractbutton';
import AbstractContainer from '../abstracts/abstractcontainer';

export default class CombatRenderer {
    public container: AbstractGroup;
    public tile_width: number;
    public tile_height: number;

    public unit_frame_pos: Vector;
    public unit_frame: AbstractSprite;
    public unit_ui: AbstractContainer;
    public deploy_ui: AbstractGroup;
    public deploy_unit: AbstractSprite;
    public deploy_classes: Array<AbstractSprite>;
    public deploy_stat_text: AbstractText;
    public ready_stat_text: AbstractText;
    public ready_btn: AbstractButton;
    public timer_text: AbstractText;
    public attack_tiles: Array<AbstractSprite>;
    public previous_tutorial_step: number;

    public get entity_adjust_y(): number {
        return this.render_context.literal(15 / 2);
    }

    public get unit_scalar(): number {
        return 4 / 2;
    }

    public get tile_scalar(): number {
        return 6 / 2;
    }

    public get unit_depth(): number {
        return 2;
    }

    public get facing_depth(): number {
        return 1;
    }

    public get overlay_depth(): number {
        return this.unit_depth + this.extent;
    }

    constructor(private readonly render_context: RenderContext, private readonly settings: ClientSettings, private readonly extent: number) {
        this.deploy_classes = new Array<AbstractSprite>();
        if (this.settings.training) this.previous_tutorial_step = 0;
    }

    public render_turn(resolubles: Array<Resoluble>): void {
        let unit_death: boolean = false;

        if (this.settings.training) {
            if (this.attack_tiles && this.attack_tiles.length) {
                for (const attack_tile of this.attack_tiles) {
                    attack_tile.destroy();
                }
            }
            this.attack_tiles = new Array<AbstractSprite>();
        }

        const faces: Array<Face> = resolubles.filter(resoluble => resoluble.type === 'Face') as any;
        for (const resoluble of faces) {
            this.update_entity_facing(resoluble.source);
        }

        const movements: Array<Move> = resolubles.filter(resoluble => resoluble.type === 'Move') as any;
        for (const resoluble of movements) {
            const position: Vector = this.local_to_world(resoluble.source.spatial.position);
            position.y += this.entity_adjust_y;
            // resoluble.source.get('sprite').set_position(position.x, position.y);

            this.render_context.scene.tweens.add({
                targets: resoluble.source.get('sprite').framework_object,
                x: position.x,
                y: position.y,
                duration: 300,
                ease: 'Power2'
            });

            this.advance_tutorial(4);
        }

        const attacks: Array<Attack> = resolubles.filter(resoluble => resoluble.type === 'Attack') as any;
        for (const resoluble of attacks) {
            for (const position of (resoluble as any).targetted_positions) {
                const world: Vector = this.local_to_world(position);
                this.render_context.render_effect('attack_effect', world, () => {
                    if (resoluble.source.team !== 1) return;
                    if (!this.settings.training) return;

                    const attack_tile: AbstractSprite = this.render_context.add_sprite(world.x, world.y, 'red_tile');
                    attack_tile.set_scale(this.tile_scalar, this.tile_scalar);
                    attack_tile.set_anchor(0.5, 0.3);
                    this.attack_tiles.push(attack_tile);
                }, this);
            }
        }

        const deaths: Array<Death> = resolubles.filter(resoluble => resoluble.type === 'Death') as any;
        for (const resoluble of deaths) {
            let animation_key: string = 'death';
            animation_key += '_' + resoluble.target.identifier.class_key;
            animation_key += resoluble.target.team === 0 ? '_blue' : '_red';

            resoluble.target.get('sprite').framework_object.play(animation_key);

            if (resoluble.target.team === 1) unit_death = true;
        }

        if (unit_death) {
            this.advance_tutorial(6);
            this.advance_tutorial(5);
        }
    }

    public update_depth(entities: Array<Entity>): void {
        for (const entity of entities) {
            entity.get('sprite').set_depth(this.unit_depth + entity.spatial.position.y);
        }
    }

    public render_stage(stage: Stage): void {
        this.container = this.render_context.add_group();

        const tile_key: string = 'base_tile';

        const tile_dimensions: Vector = this.render_context.get_sprite_dimensions(tile_key);
        tile_dimensions.x *= this.render_context.base_scale_factor;
        tile_dimensions.y *= this.render_context.base_scale_factor;
        tile_dimensions.x *= this.tile_scalar;
        tile_dimensions.y *= this.tile_scalar;
        this.tile_width = (tile_dimensions.x / 2);
        this.tile_height = (tile_dimensions.y / 4) + this.render_context.literal(1.495);

        for (let i: number = stage.width - 1; i >= 0; i--) {
            for (let j: number = 0; j < stage.height; j++) {
                const position: Vector = this.local_to_world(new Vector(i, j));

                stage.grid[i][j].sprite = this.render_context.add_sprite(position.x, position.y, tile_key, this.container);
                stage.grid[i][j].sprite.set_anchor(0.5, 0.3);
                stage.grid[i][j].sprite.set_scale(this.tile_scalar, this.tile_scalar);
            }
        }

        this.container.set_position(this.container.x + tile_dimensions.x, this.container.y + tile_dimensions.y * stage.height / 2);

        const center_world: Vector = this.local_to_world(stage.get_center());
        this.render_context.camera.centerOn(center_world.x, center_world.y);
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

    public render_banner(): void {
        const highlight: AbstractSprite = this.render_context.add_sprite(this.render_context.center_x, this.render_context.center_y, 'highlight');
        highlight.set_scale(0.9, 0.5);
        highlight.set_anchor(0.5, 0.5);
        highlight.affix_ui();
        highlight.set_depth(100);

        const text: AbstractText = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y, 'CHRONAL\nTACTICS');
        text.set_font_size(64);
        text.set_anchor(0.5, 0.5);
        text.framework_object.setLineSpacing(0);
        text.affix_ui();
        text.set_depth(100);
        text.framework_object.setAlign('center');
    }

    public render_team_ui(): void {
        const is_blue: boolean = this.settings.team === 0;
        const title_size: number = 16;
        const subtitle_size: number = 12;

        const blue_banner: AbstractSprite = this.render_context.add_sprite(0, 0, 'blue_banner');
        blue_banner.set_scale(this.unit_scalar, this.unit_scalar);
        blue_banner.set_alpha(0.8);
        blue_banner.affix_ui();

        const blue_name_text: AbstractText = this.render_context.add_text(this.render_context.buffer_sm, this.render_context.buffer_sm, is_blue ? this.settings.name : this.settings.opponent);
        blue_name_text.set_font_size(title_size);
        blue_name_text.set_max_width(this.render_context.literal(180));
        blue_name_text.affix_ui();
        const blue_team_text: AbstractText = this.render_context.add_text(blue_name_text.x, blue_name_text.y + blue_name_text.height, is_blue ? 'YOU' : 'OPPONENT');
        blue_team_text.set_font_size(subtitle_size);
        blue_team_text.affix_ui();

        const red_banner: AbstractSprite = this.render_context.add_sprite(this.render_context.width, 0, 'red_banner');
        red_banner.set_scale(this.unit_scalar, this.unit_scalar);
        red_banner.set_anchor(1, 0);
        red_banner.set_alpha(0.8);
        red_banner.affix_ui();

        const red_name_text: AbstractText = this.render_context.add_text(this.render_context.width - this.render_context.buffer_sm, this.render_context.buffer_sm, is_blue ? this.settings.opponent : this.settings.name);
        red_name_text.set_font_size(title_size);
        red_name_text.set_anchor(1, 0);
        red_name_text.affix_ui();
        const red_team_text: AbstractText = this.render_context.add_text(red_name_text.x, red_name_text.y + red_name_text.height, is_blue ? 'OPPONENT' : 'YOU');
        red_team_text.set_font_size(subtitle_size);
        red_team_text.set_anchor(1, 0);
        red_team_text.affix_ui();

        if (this.settings.training) this.render_context.set_notification_position(new Vector(this.render_context.center_x, blue_banner.y + blue_banner.height + (this.render_context.buffer * 2), this.overlay_depth));
    }

    public render_deployment_ui(deployment_tiles: Array<Vector>): void {
        this.unit_ui = this.render_context.add_container();
        this.unit_ui.set_depth(this.overlay_depth);
        this.deploy_ui = this.render_context.add_group();

        this.unit_frame = this.render_context.add_sprite(0, 0, 'unit_frame', this.unit_ui);
        this.unit_frame.set_scale(this.unit_scalar, this.unit_scalar);
        this.unit_frame.set_anchor(1, 1);
        this.unit_frame.affix_ui();

        this.unit_frame_pos = new Vector(this.render_context.width, this.render_context.height - (this.unit_frame.height / 2));
        this.unit_ui.set_position(this.unit_frame_pos.x, this.unit_frame_pos.y);

        const class_keys: Array<string> = ['bow_unit', 'spear_unit', 'sword_unit'];

        let index: number = 0;
        for (const class_key of class_keys) {
            const sprite: AbstractSprite = this.render_context.add_sprite(this.unit_frame.x, this.unit_frame.y - (this.unit_frame.height / 2), class_key, this.unit_ui);
            sprite.set_frame(this.settings.team === 0 ? 0 : 3);
            sprite.set_scale(this.unit_scalar, this.unit_scalar);
            sprite.set_anchor(1, 0.5);
            sprite.set_position(-(((sprite.width + this.render_context.buffer) * index) + sprite.width / 2), 0, true);
            sprite.affix_ui();

            this.deploy_classes.push(sprite);

            index++;
        }

        this.ready_stat_text = this.render_context.add_text(this.render_context.center_x, this.render_context.buffer_sm, '', this.deploy_ui);
        this.ready_stat_text.set_font_size(14);
        this.ready_stat_text.affix_ui();
        this.ready_stat_text.set_anchor(0.5, 0);
        this.ready_stat_text.set_depth(this.overlay_depth);

        this.deploy_stat_text = this.render_context.add_text(this.ready_stat_text.x, this.ready_stat_text.y + this.ready_stat_text.height, '', this.deploy_ui);
        this.deploy_stat_text.set_font_size(14);
        this.deploy_stat_text.affix_ui();
        this.deploy_stat_text.set_anchor(0.5, 0);
        this.deploy_stat_text.set_depth(this.overlay_depth);

        this.ready_btn = this.render_context.add_button(this.render_context.center_x, this.deploy_stat_text.y + (this.deploy_stat_text.height * 2) + (this.render_context.buffer * 2), 'generic_btn', 'Ready', this.deploy_ui);
        // this.ready_btn.set_scale(2, 2);
        this.ready_btn.affix_ui();
        this.ready_btn.set_visible(false);
        this.ready_btn.set_depth(this.overlay_depth);
        this.ready_btn.center();

        for (const deployment_tile of deployment_tiles) {
            const world: Vector = this.local_to_world(deployment_tile);
            const tile_key: string = this.settings.team === 0 ? 'blue_tile' : 'red_tile';
            const tile_sprite: AbstractSprite = this.render_context.add_sprite(world.x, world.y, tile_key, this.deploy_ui);
            tile_sprite.set_scale(this.tile_scalar, this.tile_scalar);
            tile_sprite.set_anchor(0.5, 0.3);
        }

        const deployment_center: Vector = this.local_to_world(new Vector(this.settings.team === 0 ? 1 : 5, 3));
        this.render_context.camera.pan(deployment_center.x, deployment_center.y);
    }

    public display_deployment_ui(show: boolean): void {
        this.ready_btn.set_visible(show);
        const value: number = (this.unit_frame.width - (this.render_context.buffer * 2));
        if (!show) {
            this.render_context.scene.tweens.add({
                targets: this.unit_ui.framework_object,
                x: this.unit_frame_pos.x + value,
                duration: 600,
                ease: 'Power2'
            });
        } else {
            this.render_context.scene.tweens.add({
                targets: this.unit_ui.framework_object,
                x: this.unit_frame_pos.x,
                duration: 600,
                ease: 'Power2'
            });
        }
    }

    public destroy_deployment_ui(): void {
        this.ready_btn.destroy();
        this.deploy_ui.destroy();
        this.unit_ui.destroy();
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
            this.timer_text = this.render_context.add_text(this.render_context.center_x, this.render_context.buffer_sm, '');
            this.timer_text.set_font_size(16);
            this.timer_text.set_anchor(0.5, 0);
            this.timer_text.affix_ui();
            this.timer_text.set_depth(this.overlay_depth);
        }

        this.timer_text.text = timer.toFixed(2);
    }

    public render_battle_completed(winning_team: number): void {
        let team_string: string;
        let completed_string: string;
        let fill_color: any;

        if (winning_team === 0) {
            team_string = 'Blue Victory';
            fill_color = 0x1e3359;
        } else if (winning_team === 1) {
            team_string = 'Red Victory';
            fill_color = 0x892727;
        } else {
            team_string = 'Draw';
            fill_color = 0x000;
        }

        if (winning_team < 0) {
            // completed_string = 'Tie';
        } else if (winning_team === this.settings.team) {
            completed_string = 'You Win';
        } else {
            completed_string = 'You Lose';
        }

        const alpha_fill: Phaser.GameObjects.Graphics = this.render_context.scene.add.graphics();
        alpha_fill.fillStyle(fill_color, 0.5);
        alpha_fill.fillRect(0, 0, this.render_context.width, this.render_context.height);
        alpha_fill.setScrollFactor(0, 0);
        alpha_fill.setDepth(this.overlay_depth);

        const title: AbstractText = this.render_context.add_text(this.render_context.center_x, this.render_context.center_y - this.render_context.height / 16, team_string);
        title.set_font_size(48);
        title.set_anchor(0.5, 0.5);
        title.affix_ui();
        title.set_depth(this.overlay_depth);
        title.set_stroke(8 / this.render_context.DPR);

        const subtitle: AbstractText = this.render_context.add_text(this.render_context.center_x, title.y + title.height, completed_string);
        subtitle.set_anchor(0.5, 0.5);
        subtitle.affix_ui();
        subtitle.set_depth(this.overlay_depth);
    }

    public advance_tutorial(step: number): void {
        if (!this.settings.training) return;
        if (step !== this.previous_tutorial_step + 1) return;

        switch (step) {
            case 1:
                this.render_context.display_notification('Click and drag up to four units from the bottom right hand corner of the screen onto the colored tiles to form your team. Click the ready button when satisfied.');
                break;
            case 2:
                this.render_context.hide_notification();
                break;
            case 3:
                this.render_context.display_notification('Battle progresses at a set timestep, visible at the top of the screen. All orders for both teams are resolved every time it hits 0. Move your units by clicking and dragging in a direction. You can move multiple units each turn.');
                break;
            case 4:
                this.render_context.display_notification('All units move (if ordered), then attack (always) in that order every turn. Each unit type has a different attack range. These have been outlined with red squares for opponents within the training mode. Try to attack an enemy unit, and be sure not to hit your own.');
                break;
            case 5:
                this.render_context.display_notification('The bodies of fallen units will remain, and present an obstacle that cannot be moved through. The goal of each match is to finish each unit your opponent controls. Try to complete the match.');
                break;
            case 6:
                this.render_context.hide_notification();
                break;
        }

        this.previous_tutorial_step = step;
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