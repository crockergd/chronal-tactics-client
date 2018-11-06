import { BaseEntity } from 'turn-based-combat-framework';
import Position from '../utils/position';

export default class Entity extends BaseEntity {
    private position: Position;

    constructor(position: Position)  {
        super();

        this.position = position;
    }
}