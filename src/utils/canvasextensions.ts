import AbstractScene from '../abstracts/abstractscene';
import Color from './color';

export default abstract class CanvasExtensions {
    public static radial_gradient(scene: AbstractScene, key: string, width: number, height: number, color_0: Color, color_1: Color): void {
        const diameter: number = Math.max(width, height);
        const radius: number = diameter / 2;

        const filter: string = 'none';

        const gradient_texture: Phaser.Textures.CanvasTexture = scene.textures.createCanvas(key, diameter, diameter);
        const gradient_context: CanvasRenderingContext2D = gradient_texture.getContext();
        gradient_context.filter = filter;

        const gradient: CanvasGradient = gradient_context.createRadialGradient(radius, radius, 0, radius, radius, radius);

        gradient.addColorStop(0, color_0.html);
        gradient.addColorStop(1, color_1.html);

        gradient_context.fillStyle = gradient;
        gradient_context.fillRect(0, 0, gradient_texture.width, gradient_texture.height);

        gradient_texture.refresh();
    }
}