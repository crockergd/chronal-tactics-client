import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractContainer from '../abstracts/abstractcontainer';
import Vector from '../utils/vector';
import { Textures } from 'phaser';
import Stage from '../stages/stage';
import { Turn, Entity, Resoluble } from 'turn-based-combat-framework';

export default class RenderContext {
    public scene: AbstractScene;
    public container: AbstractContainer;
    public tile_width: number;
    public tile_height: number;

    constructor() {

    }

    public update(stage: Stage): void {
        for (const entity of stage.entities) {
            // if (entity.get('dirty') as boolean) {
            const position: Vector = this.local_to_world(entity.spatial.position);
            entity.get('sprite').set_position(position.x, position.y);
            entity.set('dirty', false);

            if (!entity.alive && entity.get('sprite').visible) {
                entity.get('sprite').set_visible(false);
            }
            // }
        }
    }

    public render(stage: Stage): void {
        // stage.remaining_text.text = stage.turn_remaining.toFixed(2);
    }

    public post_tick(stage: Stage, turn: Turn): void {

    }

    public render_turn(resolubles: Array<Resoluble>): void {
        const attacks: Array<Resoluble> = resolubles.filter(resoluble => resoluble.type === 'Attack');
        for (const resoluble of attacks) {
            for (const position of (resoluble as any).targetted_positions) {
                this.render_effect('attack_effect', (position as any));
            }
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

    public initiate_battle(stage: Stage): void {
        for (const entity of stage.entities) {
            entity.set('sprite', this.add_sprite(0, 0, entity.identifier.class_key), false);
            entity.get('sprite').set_anchor(0.5, 1.0);
            entity.get('sprite').framework_object.setInteractive();
            entity.set('dirty', true);
        }

        stage.remaining_text = this.add_text(10, 10, '');
        stage.remaining_text.framework_object.setScrollFactor(0);

        this.scene.anims.create({
            key: 'attack',
            frames: this.scene.anims.generateFrameNumbers('attack_effect', {
                start: 0,
                end: 3
            })
        });
    }

    public add_container(x: number, y: number): AbstractContainer {
        const container: AbstractContainer = new AbstractContainer(this, this.scene, x, y);

        return container;
    }

    public add_sprite(x: number, y: number, key: string, container?: AbstractContainer): AbstractSprite {
        const sprite: AbstractSprite = new AbstractSprite(this, this.scene, x, y, key, container);

        return sprite;
    }

    public add_text(x: number, y: number, text: string, container?: AbstractContainer): AbstractText {
        const render_text: AbstractText = new AbstractText(this, this.scene, x, y, text, container);

        return render_text;
    }

    public get_sprite_dimensions(key: string): Vector {
        const sprite: Textures.Frame = this.scene.textures.getFrame(key);

        return new Vector(sprite.width, sprite.height);
    }

    private local_to_world(position: Vector): Vector {
        return new Vector(this.container.x + (position.x * this.tile_width) + (position.y * this.tile_width),
            this.container.y + (position.y * this.tile_height) - (position.x * this.tile_height));
    }
}