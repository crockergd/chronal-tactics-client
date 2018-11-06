import { AbstractText } from "../phaser/abstracttext";
import AbstractScene from "../phaser/abstractscene";

export default class RenderContext {
    public scene: AbstractScene;

    constructor() {

    }

    public add_text(x: number, y: number, text: string): AbstractText {
        const render_text: AbstractText = new AbstractText(this, this.scene, x, y, text);

        return render_text;
    }
}