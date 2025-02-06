import RenderContext from "../contexts/rendercontext";
import AbstractScene from "./abstractscene";

export default class AbstractSound {
    public framework_object: Phaser.Sound.BaseSound;

    public get active(): boolean {
        return this.framework_object.isPlaying;
    }

    constructor(private readonly renderer: RenderContext, private readonly scene: AbstractScene, readonly key: string, readonly channel, volume: number = 1, loop: boolean = false) {
        this.framework_object = this.scene.sound.add(key, {
            volume: volume,
            loop: loop
        });
    }

    public play(): void {
        this.framework_object.play();
    }

    public stop(): void {
        this.framework_object.stop();
    }
}