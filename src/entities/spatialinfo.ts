import Vector from '../utils/vector';

export default interface SpatialInfo {
    position: Vector;
    facing: Vector;
    has_moved: boolean;
}