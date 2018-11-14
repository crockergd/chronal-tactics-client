import { Resoluble, Entity } from 'turn-based-combat-framework';

export default class Move extends Resoluble {
    constructor(readonly source: Entity) {
        super();

        this.type = 'Move';
    }

    public resolve(): void {
        if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y > 0) {
            this.source.spatial.position.y++;
        } else if (this.source.spatial.facing.x > 0 && this.source.spatial.facing.y < 0) {
            this.source.spatial.position.x++;
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y > 0) {
            this.source.spatial.position.x--;
        } else if (this.source.spatial.facing.x < 0 && this.source.spatial.facing.y < 0) {
            this.source.spatial.position.y--;
        }

        this.source.set('dirty', true);
    }

    public undo(): void {

    }
}