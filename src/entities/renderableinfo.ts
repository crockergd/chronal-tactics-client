import AbstractSprite from '../abstracts/abstractsprite';

export default interface RenderableInfo {
    sprite_key: string;
    dirty: boolean;
    sprite: AbstractSprite;
}