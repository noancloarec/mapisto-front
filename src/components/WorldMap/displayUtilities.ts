/**
* Computes the top-left and right-bottom point of the visible svg (the viewbox actually does not represent what is viewed on screen)
*/
export function getVisibleSVG(svgContainer: HTMLDivElement) {
    return {
        origin: svgCoords(svgContainer.offsetLeft, svgContainer.offsetTop, svgContainer),
        end: svgCoords(svgContainer.offsetLeft + svgContainer.clientWidth, svgContainer.offsetTop + svgContainer.clientHeight, svgContainer)
    }
}
/**
 * Given a point in a pixel-based frame (within the window), gives the corresponding svg coordinate
 * @param x The x coordinate (in pixel, within the window) of the point
 * @param y The y coordinate (in pixel, within the window) of the point
 */
export function svgCoords(x: number, y: number, svgContainer: HTMLDivElement): DOMPoint {
    const pt = new DOMPoint(x, y);
    return pt.matrixTransform(svgContainer.querySelector('svg').getScreenCTM().inverse())
}

/**
 * Tells how many points lie in 1 pixel on the map
 */
export function howManyPointsPerPixel(svgContainer: HTMLDivElement): number {
    const visibleSVG = getVisibleSVG(svgContainer)
    const width = visibleSVG.end.x - visibleSVG.origin.x
    const pxWidth = svgContainer.clientWidth;
    return width / pxWidth;
}

export function getActualViewedWidth(svgContainer: HTMLDivElement): number {
    const visible = getVisibleSVG(svgContainer)
    return visible.end.x - visible.origin.x
}

/**
 * Given a size in point (svg frame), computes the on-screen size in pixels
 * @param svgSize the size in points
 */
export function translateSVGDistanceToPixel(distance: number, svgContainer: HTMLDivElement) {
    const svg = svgContainer.querySelector('svg');
    const matrix = svg.getScreenCTM()

    const origin = svg.createSVGPoint()
    const distant = svg.createSVGPoint()
    distant.x = distance

    const originPx = origin.matrixTransform(matrix)
    const ptPX = distant.matrixTransform(matrix)
    return ptPX.x - originPx.x
}
