export function getLabelColor(backgroundColor: string) {
    const luminosity = getLuminosity(backgroundColor);
    return luminosity > 80 ? 'black' : 'white';
}

export function getOverlayColor(backgroundColor: string) {
    const luminosity = getLuminosity(backgroundColor);
    return luminosity > 80 ? 'black' : 'white';

}

/**
 * Compute the L (luminosity) parameter of the LaB representation of an RGB pixel
 * Used to determine if the name f the country should be written white
 * (if territory color is dark) or  black (if territory color is light)
 * @param color
 */
function getLuminosity(color: string) {
    const rgb = hexToRgb(color.substr(1));
    let r = rgb[0] / 255;
    let g = rgb[1] / 255;
    let b = rgb[2] / 255;
    let y;

    r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
    g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
    b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
    y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;

    y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;

    return (116 * y) - 16;
}

/**
 * Computes the RGB representation of an hexadecimal color
 * @param hex The hex representation of the color
 */
function hexToRgb(hex: string): number[] {
    const bigint = parseInt(hex, 16);
    // tslint:disable-next-line: no-bitwise
    const r = (bigint >> 16) & 255;
    // tslint:disable-next-line: no-bitwise
    const g = (bigint >> 8) & 255;
    // tslint:disable-next-line: no-bitwise
    const b = bigint & 255;

    return [r, g, b];
}
