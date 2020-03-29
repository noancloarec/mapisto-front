import { SVGManager } from "../MapistoMap/SVGManager";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { getVisibleSVG } from "../MapistoMap/display-utilities";

export class NavigableSVGManager extends SVGManager {
    private onZoomOrPan: (vb: ViewBoxLike) => void;

    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        super.initMap(svgParent, vb);
        this.drawing.panZoom({ oneFingerPan: true });
        const triggerChange = () => {
            if (this.onZoomOrPan) {
                this.onZoomOrPan(getVisibleSVG(this.parentElement));
            }
        };
        this.drawing.on('zoom', triggerChange);
        this.drawing.on('panning', triggerChange);
        triggerChange();
    }

    attachOnZoomOrPan(fn: (vb: ViewBoxLike) => void) {
        this.onZoomOrPan = fn;
    }

}