import { SVGManager } from "../MapistoMap/SVGManager";
import { ViewBoxLike } from "@svgdotjs/svg.js";

export class NavigableSVGManager extends SVGManager {
    private onZoomOrPan: () => void;

    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        super.initMap(svgParent, vb);
        this.drawing.panZoom({ oneFingerPan: true, zoomFactor: .1 });
        const triggerChange = () => {
            if (this.onZoomOrPan) {
                this.onZoomOrPan();
            }
        };

        this.drawing.on('zoom', triggerChange);
        this.drawing.on('panning', triggerChange);
        triggerChange();
    }

    attachOnZoomOrPan(fn: () => void) {
        this.onZoomOrPan = fn;
    }

}