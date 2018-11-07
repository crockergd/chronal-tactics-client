import Cell from './cell';
import AbstractContainer from '../abstracts/abstractcontainer';
import Entity from '../entities/entity';

export default class Stage {
    public width: number;
    public height: number;
    public depth: number;

    public tile_width: number;
    public tile_height: number;

    public container: AbstractContainer;
    public grid: Cell[][];
    public entities: Entity[];

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
}