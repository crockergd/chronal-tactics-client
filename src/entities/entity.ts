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
            facing: new Vector(1, 1, 0),
            has_moved: false
        }
        this.renderable = {
            sprite_key: sprite_key,
            dirty: true,
            sprite: null
        };
    }
}