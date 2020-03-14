export interface Rectangle {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}

/**
 * Tells if 2 rectangle have an intersecting area
 * @param a Rectangle a
 * @param b Rectangle
 */
export function intersect(a: Rectangle, b: Rectangle): boolean {
    return !(
        a.x2 < b.x1
        || b.x2 < a.x1
        || a.y2 < b.y1
        || b.y2 < a.y1
    );
}

