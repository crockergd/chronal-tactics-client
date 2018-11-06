import AbstractScene from '../phaser/abstractscene';
import { Battle, TickMode } from 'tbcf';
import Entity from '../entities/entity';
import Stage from '../entities/stage';
import Position from '../utils/position';

export default class Combat extends AbstractScene {
    private battle: Battle;
    private stage: Stage;

    public init(data: any) {
        this.scene_context = data.scene_context;
    }

    public create(): void {
        this.battle = new Battle(TickMode.SYNC);
        this.stage = new Stage(5, 5, 1);

        const player: Entity = new Entity(new Position(1, 1, 1));
        const enemy: Entity = new Entity(new Position(4, 4, 1));

        this.battle.add_entity(player);
        this.battle.add_entity(enemy);
    }

    public update(time: number, dt_ms: number): void {
        const dt: number = dt_ms / 1000;
        this.battle.update(dt);
    }

    public render(): void {

    }
}