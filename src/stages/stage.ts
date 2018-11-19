import Cell from './cell';
import AbstractContainer from '../abstracts/abstractcontainer';
import AbstractText from '../abstracts/abstracttext';
import Vector from '../utils/vector';
import { Battle, TickMode, Entity } from 'turn-based-combat-framework';

export default class Stage {
    public battle: Battle;
    public width: number;
    public height: number;
    public depth: number;
    public turn_remaining: number;

    public grid: Cell[][];

    public remaining_text: AbstractText;

    public get entities(): Entity[] {
        return this.battle.get_entities();
    }

    constructor(width: number, height: number, depth: number) {
        this.battle = new Battle(TickMode.SYNC);

        this.width = width;
        this.height = height;
        this.depth = depth;
        this.grid = [];

        for (let i: number = 0; i < this.width; i++) {
            this.grid[i] = [];
            for (let j: number = 0; j < this.height; j++) {
                this.grid[i][j] = new Cell();
            }
        }
    }

    public get_entity_by_position(position: Vector): Entity {
        for (const entity of this.entities) {
            if (entity.spatial.position.x === position.x && entity.spatial.position.y === position.y && entity.spatial.position.z === position.z) return entity;
        }

        return null;
    }

    public get_center(): Vector {
        const center_x: number = Math.round((this.width - 1) / 2);
        const center_y: number = Math.round((this.height - 1) / 2);

        return new Vector(center_x, center_y);
    }
    
    public toJSON(): any {
        const json: any = {
            battle: this.battle,
            width: this.width,
            height: this.height,
            depth: this.depth,
        };

        return json;
    }

    public static fromJSON(json: any): Stage {
        const obj: Stage = new Stage(json.width, json.height, json.depth);

        obj.battle = Battle.fromJSON(json.battle);        

        return obj;
    }
}