import AbstractScene from '../abstracts/abstractscene';
import AbstractText from '../abstracts/abstracttext';
import AbstractSprite from '../abstracts/abstractsprite';
import AbstractContainer from '../abstracts/abstractcontainer';
import Vector from '../utils/vector';
import { Textures } from 'phaser';
import Stage from '../stages/stage';
import Entity from '../entities/entity';
import { Turn } from 'turn-based-combat-framework';

export default class RenderContext {
    public scene: AbstractScene;

    constructor() {

    }

    public update(stage: Stage): void {
        for (const entity of stage.entities) {
            if (entity.renderable.dirty) {
                const position: Vector = this.local_to_world(entity, stage);
                entity.renderable.sprite.set_position(position.x, position.y);
                entity.renderable.dirty = false;
            }
        }
    }

    public render(stage: Stage): void {
        stage.remaining_text.text = stage.turn_remaining.toFixed(2);
    }

    public post_tick(stage: Stage, turn: Turn): void {
        
    }

    public initiate_battle(stage: Stage): void {
        for (const entity of stage.entities) {
            entity.renderable.sprite = this.add_sprite(0, 0, entity.renderable.sprite_key);
            entity.renderable.sprite.set_anchor(0.5, 1.0);
            entity.renderable.sprite.framework_object.setInteractive();
            entity.renderable.dirty = true;
        }

        stage.remaining_text = this.add_text(10, 10, '');
        stage.remaining_text.framework_object.setScrollFactor(0);
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

    private local_to_world(entity: Entity, stage: Stage): Vector {
        return new Vector(stage.container.x + (entity.spatial.position.x * stage.tile_width) + (entity.spatial.position.y * stage.tile_width), 
            stage.container.y + (entity.spatial.position.y *  stage.tile_height) - (entity.spatial.position.x * stage.tile_height));
    }
}