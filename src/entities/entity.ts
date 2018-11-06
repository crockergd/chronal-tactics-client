import { BaseEntity } from 'tbcf';
import Position from '../utils/position';

export default class Entity extends BaseEntity {
    private position: Position;

    constructor(position: Position)  {
        super();

        this.position = position;
    }
}