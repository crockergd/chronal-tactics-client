export const enum AbstractDepth {
    BASELINE = 0,
    BG = BASELINE - 1,
    TILE = BASELINE + 1,
    UNIT = TILE + 1,
    UI = UNIT + 1
}

export default AbstractDepth;