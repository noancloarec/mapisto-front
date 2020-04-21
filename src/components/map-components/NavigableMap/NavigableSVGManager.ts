import { SVGManager } from "../MapistoMap/SVGManager";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import Hammer from 'hammerjs';
import { MapistoPoint } from "src/entities/MapistoPoint";
interface DragState {
    dragging: boolean;
    viewBoxOrigin: ViewBoxLike;
}
interface PinchState {
    pinching: boolean;
    viewBoxOrigin: ViewBoxLike;
    zoomCenter: MapistoPoint;
}
export class NavigableSVGManager extends SVGManager {
    private onZoomOrPan: (vb: ViewBoxLike) => void;
    private dragState: DragState;
    private pinchState: PinchState;
    private static MIN_SIDE_SIZE = 10;

    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        super.initMap(svgParent, vb);
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
    }


    private initListeners() {

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
        this.dragState.viewBoxOrigin = this.getViewBox();

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
        this.onZoomOrPan(newVB);

    }


    private initPinch(event: HammerInput) {
        this.pinchState = {
            pinching: true,
            viewBoxOrigin: this.getViewBox(),
            zoomCenter: { x: event.center.x, y: event.center.y }
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
        const scrollSpeed = 1.1;
        const scale = event.deltaY < 0 ? scrollSpeed : 1 / scrollSpeed;

        this.doZoom(scale, this.getViewBox(), { x: event.x, y: event.y });
    }

    private doZoom(scale: number, fromViewbox: ViewBoxLike, center: MapistoPoint) {
        const width = fromViewbox.width / scale;
        const height = fromViewbox.height / scale;
        const dw = width - fromViewbox.width;
        const dh = height - fromViewbox.height;
        const xratio = (center.x - this.getClientViewbox().x) / this.getClientViewbox().width;
        const yratio = (center.y - this.getClientViewbox().y) / this.getClientViewbox().height;
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

            this.onZoomOrPan(newVB);
        }
    }
}
