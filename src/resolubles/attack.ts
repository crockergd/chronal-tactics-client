import { Resoluble } from 'turn-based-combat-framework';
import Entity from '../entities/entity';
import Stage from '../stages/stage';
import Vector from '../utils/vector';

export default class Attack extends Resoluble {
    private targetted_positions: Vector[];

    constructor(readonly source: Entity, readonly stage: Stage) {
        super();

        this.targetted_positions = [];
    }

    public resolve(): void {
        let initial_position: Vector;
        let horizontal: boolean = true;

        if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y > 0) {
            initial_position = new Vector(this.source.spatial.position.x, this.source.spatial.position.y + 1, this.source.spatial.position.z);
            horizontal = false;
        } else if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y < 0) {
            initial_position = new Vector(this.source.spatial.position.x + 1, this.source.spatial.position.y, this.source.spatial.position.z);
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y > 0) {
            initial_position = new Vector(this.source.spatial.position.x - 1, this.source.spatial.position.y, this.source.spatial.position.z);
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y < 0) {
            initial_position = new Vector(this.source.spatial.position.x, this.source.spatial.position.y - 1, this.source.spatial.position.z);
            horizontal = false;
        }

        if (this.source.renderable.sprite_key === 'bandit') {
            let second_position: Vector;
            let third_position: Vector;

            if (horizontal) {
                second_position = new Vector(initial_position.x, initial_position.y + 1, initial_position.z);
                third_position = new Vector(initial_position.x, initial_position.y - 1, initial_position.z);
            } else {
                second_position = new Vector(initial_position.x + 1, initial_position.y, initial_position.z);
                third_position = new Vector(initial_position.x - 1, initial_position.y, initial_position.z);
            }

            this.targetted_positions.push(initial_position);
            this.targetted_positions.push(second_position);
            this.targetted_positions.push(third_position);

        } else if (this.source.renderable.sprite_key === 'spearman') {
            let second_position: Vector;

            if (horizontal) {
                second_position = new Vector(initial_position.x + 1, initial_position.y, initial_position.z);
            } else {
                second_position = new Vector(initial_position.x, initial_position.y + 1, initial_position.z);
            }

            this.targetted_positions.push(initial_position);
            this.targetted_positions.push(second_position);
        }

        const targets: Entity[] = [];
        for (const position of this.targetted_positions) {
            const entity: Entity = this.stage.get_entity_by_position(position);
            if (!entity) continue;

            targets.push(entity);
        }

        // for (const entity of targets) {
        //     console.log(entity);
        // }

        this.source.renderable.dirty = true;
    }

    public undo(): void {

    }
}