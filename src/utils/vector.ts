export default class Vector {
    public x: number;
    public y: number;
    public z?: number;
    public w?: number;

    public get width(): number {
        return this.x;
    }

    public get height(): number {
        return this.y;
    }

    constructor(x: number, y: number, z?: number, w?: number) {
        this.set(x, y, z, w);
    }

    public set(x: number, y: number, z?: number, w?: number) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.w = w;
    }

    public static create_from_vector(vector: Vector): Vector {
        return new Vector(vector.x, vector.y, vector.z);
    }
}