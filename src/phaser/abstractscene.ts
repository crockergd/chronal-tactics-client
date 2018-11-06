import SceneContext from '../contexts/scenecontext';
import { Scene } from 'phaser';

export default class AbstractScene extends Scene {
    protected scene_context: SceneContext;    
}