import Cell from './cell';
import AbstractContainer from '../abstracts/abstractcontainer';
import Entity from '../entities/entity';
import AbstractText from '../abstracts/abstracttext';
import Vector from '../utils/vector';

export default class Stage {
    public width: number;
    public height: number;
    public depth: number;

    public turn_remaining: number;
    public tile_width: number;
    public tile_height: number;

    public container: AbstractContainer;
    public grid: Cell[][];
    public entities: Entity[];

    public remaining_text: AbstractText;

    constructor(width: number, height: number, depth: number) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.grid = [];
        this.entities = [];

        for (let i: number = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j: number = 0; j < this.height; j++) {
                this.grid[i][j] = new Cell();
            }
        }
    }

    public add_entity(entity: Entity): void {
        this.entities.push(entity);
    }

    public get_entity_by_position(position: Vector): Entity {
        for (const entity of this.entities) {
            if (entity.spatial.position.x === position.x && entity.spatial.position.y === position.y && entity.spatial.position.z === position.z) return entity;
        }

        return null;
    }
}