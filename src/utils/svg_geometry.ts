import { ViewBoxLike } from '@svgdotjs/svg.js';

/**
 * Tells if 2 rectangle have an intersecting area
 * @param a Rectangle a
 * @param b Rectangle
 */
export function intersect(a: ViewBoxLike, b: ViewBoxLike): boolean {

    return !(
        a.x + a.width < b.x
        || b.x + b.width < a.x
        || a.y + a.height < b.y
        || b.y + b.height < a.y
    );
}

