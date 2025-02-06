import { GameObjects } from 'phaser';
import RenderContext from '../contexts/rendercontext';
import AbstractBaseType from './abstractbasetype';
import { AbstractCollectionType } from './abstractcollectiontype';
import AbstractScene from './abstractscene';

export default class AbstractGraphic extends AbstractBaseType {
    public override framework_object: GameObjects.Graphics;

    constructor(renderer: RenderContext, scene: AbstractScene, x: number, y: number, width: number, height: number, fill?: number, alpha?: number, collection?: AbstractCollectionType) {
        super(renderer, x, y);

        const framework_object: GameObjects.Graphics = scene.add.graphics();
        this.set_framework_object(framework_object);

        if (fill) this.framework_object.fillStyle(fill, alpha);
        this.framework_object.fillRect(x, y, width, height);

        if (collection) {
            collection.add(this);
        } else {
            this.update_position();
        }
    }

    public set_scale(x: number, y: number): void {
        this.framework_object.scaleX *= x;
        this.framework_object.scaleY *= y;
    }
}