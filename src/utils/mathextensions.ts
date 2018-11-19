export default class MathExtensions {
    /**
     * Returns a random inclusive integer
     * 
     * @param min - Minimum possible value
     * @param max - Maximum possible value
     */
    public static rand_int_inclusive(min: number, max: number): number {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Returns a random boolean value, defaulting to 50/50
     * @param ratio - Probability of returning true
     */
    public static coin_flip(ratio?: number): boolean {        
        if (ratio !== 0) ratio = ratio || 0.5;
        return Math.random() < ratio;
    }

    public static vary_percentage(base_amount: number, variable_percentage: number): number {
        let variable_amount: number = Math.round(base_amount * variable_percentage);
        let varied_amount: number = MathExtensions.rand_int_inclusive(0, variable_amount * 2);

        return base_amount + varied_amount - variable_amount;
    }
}