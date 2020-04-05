import { SVGManager } from "../MapistoMap/SVGManager";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import Hammer from 'hammerjs';
import { svgCoords } from "../MapistoMap/display-utilities";
interface DragState {
    dragging: boolean;
    viewBoxOrigin: ViewBoxLike;
}
interface PinchState {
    pinching: boolean;
    viewBoxOrigin: ViewBoxLike;
    zoomCenter: DOMPoint;
}
export class NavigableSVGManager extends SVGManager {
    private onZoomOrPan: (vb: ViewBoxLike) => void;
    private dragState: DragState;
    private viewbox: ViewBoxLike;
    private pixelViewBox: ViewBoxLike;
    private pinchState: PinchState;
    private static MIN_SIDE_SIZE = 10;

    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        super.initMap(svgParent, vb);
        this.setViewbox(this.getVisibleSVG());
        this.dragState = {
            viewBoxOrigin: null,
            dragging: false
        };
        this.pinchState = {
            pinching: false,
            viewBoxOrigin: undefined,
            zoomCenter: undefined
        };
        this.initListeners();
        this.refreshPixelViewBox();
    }

    private refreshPixelViewBox() {

        const rect = this.parentElement.getBoundingClientRect();
        this.pixelViewBox = {
            x: rect.left,
            y: rect.top,
            width: rect.width,
            height: rect.height
        };
    }

    private initListeners() {

        window.addEventListener('resize', () => {
            this.refreshPixelViewBox();
            this.setViewbox(this.getVisibleSVG(false));
        });
        this.parentElement.addEventListener('wheel', zoomEvent => this.handleWheel(zoomEvent as WheelEvent));

        const ham = new Hammer(this.parentElement, {
            touchAction: 'none'
        });

        // Pan event, on mobile & desktop
        ham.on('pan', (e: HammerInput) => this.handlePan(e));

        // Pinch event, only on mobile
        ham.get('pinch').set({
            enable: true
        });
        ham.on('pinch', (e: HammerInput) => this.handlePinch(e));

    }

    attachOnZoomOrPan(fn: (vb: ViewBoxLike) => void) {
        this.onZoomOrPan = fn;
    }



    private initDrag() {
        this.dragState.dragging = true;
        this.dragState.viewBoxOrigin = this.drawing.viewbox();

    }

    private getSVGDistance(distance: number) {
        return distance * this.getViewBox().width / this.pixelViewBox.width;
    }

    private getViewBox() {
        return this.viewbox;
    }

    private setViewbox(vb: ViewBoxLike) {
        this.drawing.viewbox(vb);
        this.viewbox = vb;
    }

    /**
     * @param event The pan event
     */
    private handlePan(event: HammerInput): void {
        if (!this.dragState.dragging) {
            this.initDrag();
        }
        if (event.eventType === Hammer.INPUT_END) {
            this.dragState.dragging = false;
            this.dragState.viewBoxOrigin = undefined; // TODO : Remove?
            return;
        }

        const vb = this.dragState.viewBoxOrigin;
        const newVB = {
            ...vb,
            x: vb.x + this.getSVGDistance(-event.deltaX),
            y: vb.y + this.getSVGDistance(-event.deltaY)
        };
        this.setViewbox(newVB);
        this.onZoomOrPan(newVB);

    }


    private initPinch(event: HammerInput) {
        this.pinchState = {
            pinching: true,
            viewBoxOrigin: this.getViewBox(),
            zoomCenter: new DOMPoint(event.center.x, event.center.y)
        };
    }
    private handlePinch(event: HammerInput) {
        if (event.eventType === Hammer.INPUT_START) {
            this.initPinch(event);
        }
        this.doZoom(event.scale, this.pinchState.viewBoxOrigin, this.pinchState.zoomCenter);
    }


    /**
     * Performs the zoom on the map given a target and a zoom direction
     * @param targetX The mouse x coordinate (in window)
     * @param targetY The mouse y coordinate (in window)
     * @param direction >0 for zoom, <0 for unzoom
     */
    private handleWheel(event: WheelEvent) {
        // TODO make it depend on the global map-width variable (not hard coded)
        const minSideSize = 10; // the maps viewbox width or height cannot be inferior to 10 points
        // TODO : Make it global?
        const scrollSpeed = 1.1;
        const vb = this.getViewBox();



        const scale = this.getNormalizedDelta(event.deltaY) === -1 ? scrollSpeed : 1 / scrollSpeed;

        this.doZoom(scale, this.getViewBox(), new DOMPoint(event.x, event.y));
    }

    private doZoom(scale: number, fromViewbox: ViewBoxLike, center: DOMPoint) {
        const width = fromViewbox.width / scale;
        const height = fromViewbox.height / scale;
        const dw = width - fromViewbox.width;
        const dh = height - fromViewbox.height;
        const xratio = (center.x - this.pixelViewBox.x) / this.pixelViewBox.width;
        const yratio = (center.y - this.pixelViewBox.y) / this.pixelViewBox.height;
        const dx = dw * xratio;
        const dy = dh * yratio;
        const x = fromViewbox.x - dx;
        const y = fromViewbox.y - dy;

        if (width >= NavigableSVGManager.MIN_SIDE_SIZE && height >= NavigableSVGManager.MIN_SIDE_SIZE) {
            const newVB = {
                x,
                y,
                width,
                height
            };

            this.setViewbox(newVB);
            this.onZoomOrPan(newVB);
        }
    }


    private getNormalizedDelta(deltaY: number) {
        return (deltaY > 0) ? 1 : -1;
    }


}
