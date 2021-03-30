export default class Color {
    public r: number;
    public g: number;
    public b: number;
    public a: number;

    public get html(): string {
        return 'rgb(' + this.r + ',' + this.g + ',' + this.b + ',' + this.a + ')';
    }

    constructor(private readonly _r: number, private readonly _g: number, private readonly _b: number, private readonly _a: number = 1) {
        this.r = _r;
        this.g = _g;
        this.b = _b;
        this.a = _a;
    }

    public brightness(value: number): Color {
        return new Color(this.r * value, this.g * value, this.b * value, this.a);
    }

    public alpha(value: number): Color {
        return new Color(this.r, this.g, this.b, this.a * value);
    }

    public default(): void {
        this.r = this._r;
        this.b = this._b;
        this.g = this._g;
        this.a = this._a;
    }
}