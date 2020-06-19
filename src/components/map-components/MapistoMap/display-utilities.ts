import { ViewBoxLike, Box } from '@svgdotjs/svg.js';
import { config } from 'src/config';
import { SVGManager } from './SVGManager';

/**
 * Computes the top-left and right-bottom point of the visible svg
 * (the viewbox actually does not represent what is viewed on screen depending on the svg aspect ratio)
 */
export function getVisibleSVG(svgContainer: HTMLDivElement): ViewBoxLike {
    const boundings = svgContainer.getBoundingClientRect();
    const origin = svgCoords(boundings.left, boundings.top, svgContainer);
    const end = svgCoords(
        boundings.left + boundings.width,
        boundings.top + boundings.height,
        svgContainer
    );
    return {
        x: origin.x,
        y: origin.y,
        width: end.x - origin.x,
        height: end.y - origin.y
    };
}


/**
 * Given a point in a pixel-based frame (within the window), gives the corresponding svg coordinate
 * @param x The x coordinate (in pixel, within the window) of the point
 * @param y The y coordinate (in pixel, within the window) of the point
 */
export function svgCoords(x: number, y: number, svgContainer: HTMLDivElement): DOMPoint {
    const svg = svgContainer.querySelector('svg');
    const fromSVG = svg.createSVGPoint();
    fromSVG.x = x;
    fromSVG.y = y;
    const resFromSVG = fromSVG.matrixTransform(svg.getScreenCTM().inverse());
    return resFromSVG;
}

// function getAncestors(node: HTMLElement): Element[] {
//     if (!node.parentElement) {
//         return [];
//     } else {
//         return [node.parentElement, ...getAncestors(node.parentElement)];
//     }
// }


// /**
//  * Given a size in point (svg frame), computes the on-screen size in pixels
//  * @param svgSize the size in points
//  */
// export function translateSVGDistanceToPixel(distance: number, svgContainer: HTMLDivElement) {
//     const svg = svgContainer.querySelector('svg');
//     const matrix = svg.getScreenCTM();

//     const origin = svg.createSVGPoint();
//     const distant = svg.createSVGPoint();
//     distant.x = distance;

//     const originPx = origin.matrixTransform(matrix);
//     const ptPX = distant.matrixTransform(matrix);
//     return ptPX.x - originPx.x;
// }



/**
 * Determines the size of a text label, as a compromise between the width, height of bbox, and map width
 * @param bbox the territory's bbox
 */
export function computeTerritoryNameSize(bbox: Box, svgWidth: number) {
    return Math.max(Math.min(bbox.width, bbox.height) / 20, svgWidth / 100);
}

export function getMapPrecision(pointsPerPixel: number) {
    return getClosestPrecision(getKilometersPerPixel(pointsPerPixel) * .7);
}

/**
 * Mapisto only has a few levels of precision
 * (i.e. precision to ask to the server). Defined in config.precision_levels
 * This function returns the first precision levels that satisfy the number of kilometers per pixels
 * @param kmPerPX the number of kilometer per pixel on the map
 */
function getClosestPrecision(kmPerPX: number): number {
    return config.precision_levels.reduce((prev, curr) => {
        return (Math.abs(curr - kmPerPX) < Math.abs(prev - kmPerPX) ? curr : prev);
    });
}

/**
 * Computes the number of kilometers represented in 1 pixel on the map.
 */
function getKilometersPerPixel(pointsPerPixel: number): number {
    // the svg has a point-based coordinate system
    const kmPerPoint = 40000 / 2269;

    return kmPerPoint * pointsPerPixel;
}


export function enlargeViewBox(vb: ViewBoxLike, resizeFactor: number): ViewBoxLike {
    return {
        x: vb.x - (resizeFactor - 1) * vb.width / 2,
        y: vb.y - (resizeFactor - 1) * vb.height / 2,
        width: vb.width * resizeFactor,
        height: vb.height * resizeFactor
    };
}

export function fitViewboxToAspectRatio(vb: ViewBoxLike, aspectRatio: number): ViewBoxLike {
    const aspect = vb.width / vb.height;
    if (aspect < aspectRatio) {
        return {
            ...vb,
            width: aspectRatio * vb.height,
            x: vb.x - (aspectRatio * vb.height - vb.width) / 2
        };
    } else if (aspect > aspectRatio) {
        return {
            ...vb,
            height: vb.width / aspectRatio,
            y: vb.y - (vb.width / aspectRatio - vb.height) / 2
        };
    } else {
        return vb;
    }
}



export function viewboxAsString(vb: ViewBoxLike): string {
    if (!vb) {
        return "0 0 0 0";
    }
    return `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
}