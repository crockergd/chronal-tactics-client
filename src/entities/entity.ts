import { BaseEntity } from 'turn-based-combat-framework';
import SpatialInfo from './spatialinfo';
import RenderableInfo from './renderableinfo';
import Vector from '../utils/vector';

export default class Entity extends BaseEntity {
    public spatial: SpatialInfo;
    public renderable: RenderableInfo;

    constructor(sprite_key: string) {
        super();

        this.spatial = {
            position: new Vector(0, 0, 0),
            facing: new Vector(1, 1, 0)
        }
        this.renderable = {
            sprite_key: sprite_key,
            dirty: true,
            sprite: null
        };
    }

    public move(): void {
        if (this.spatial.facing.x > 0 && this.spatial.facing.y > 0) {
            this.spatial.position.y++;
        } else if (this.spatial.facing.x > 0 && this.spatial.facing.y < 0) {
            this.spatial.position.x++;
        } else if (this.spatial.facing.x < 0 && this.spatial.facing.y > 0) {
            this.spatial.position.x--;
        } else if (this.spatial.facing.x < 0 && this.spatial.facing.y < 0) {
            this.spatial.position.y--;
        }

        this.renderable.dirty = true;
    }
}