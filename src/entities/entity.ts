import { BaseEntity } from 'turn-based-combat-framework';
import SpatialInfo from './spatialinfo';
import RenderableInfo from './renderableinfo';
import Vector from '../utils/vector';
import IdentifierInfo from './identifierinfo';
import Team from './team';

export default class Entity extends BaseEntity {
    public identifier: IdentifierInfo;
    public spatial: SpatialInfo;
    public renderable: RenderableInfo;

    constructor(sprite_key: string, team: Team, position: Vector) {
        super();

        this.identifier = {
            team: team
        };

        this.spatial = {
            position: position,
            facing: new Vector(1, -1, 0),
            has_moved: false
        };

        this.renderable = {
            sprite_key: sprite_key,
            dirty: true,
            sprite: null
        };
    }
}