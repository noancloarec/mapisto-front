import { MapDomManager } from "./MapDomManager";
import { Subject } from "rxjs";
import Hammer from 'hammerjs'
import { Observable } from "rxjs";

/**
 * Handles the mouse event (desktop & mobile) to perform a zoom or drag on the map
 */
export class MapNavigator {
    /**
     * A reference to the domManager to attach Listener and change the svg viewbox
     */
    private domManager: MapDomManager

    /**
     * Notify observers when drag or zoom is performed
     */
    private zoomSubject: Subject<void>
    private draggingSubject: Subject<void>

    /**
     * Used to compute dragging
     */
    private absoluteDragStartPoint: DOMPoint
    private svgDragStartPoint: DOMPoint;
    private dragging: boolean;


    constructor(domManager: MapDomManager) {
        this.domManager = domManager
        this.draggingSubject = new Subject<void>();
        this.zoomSubject = new Subject<void>();

        // wheel event only on desktop
        this.domManager.getListener('wheel').subscribe(zoomEvent => this.handleWheel(zoomEvent as WheelEvent))

        const ham = new Hammer(this.domManager.getNativeContainer(), {
            touchAction: 'none'
        });

        // Pan event, on mobile & desktop
        ham.on('pan', (e: HammerInput) => this.handlePan(e))

        // Pinch event, only on mobile
        ham.get('pinch').set({
            enable: true
        })
        ham.on('pinch', (e: HammerInput) => this.handlePinch(e));
    }

    /**
     * Returns an observable emitting a notification each time the map is dragged
     */
    getDragListener(): Observable<void> {
        return this.draggingSubject.asObservable();
    }

    /**
     * Returns an observable emitting a notification every time the map is zoomed/unzoomed
     */
    getZoomListener(): Observable<void> {
        return this.zoomSubject.asObservable();
    }

    /**
     * 
     * @param event The pan event
     */
    private handlePan(event: HammerInput): void {
        if (!this.dragging) {
            this.dragging = true;
            this.svgDragStartPoint = this.domManager.svgCoords(event.center.x, event.center.y)
            this.absoluteDragStartPoint = new DOMPoint(event.center.x, event.center.y)
        }
        const targetPoint = new DOMPoint(this.absoluteDragStartPoint.x + event.deltaX, this.absoluteDragStartPoint.y + event.deltaY);
        const targetOnMap = this.domManager.svgCoords(targetPoint.x, targetPoint.y)
        const svgDeltaX = this.svgDragStartPoint.x - targetOnMap.x
        const svgDeltaY = this.svgDragStartPoint.y - targetOnMap.y
        this.domManager.shiftViewBox(svgDeltaX, svgDeltaY)
        this.draggingSubject.next();
        if (event.isFinal) {
            this.dragging = false;
            this.absoluteDragStartPoint = undefined // TODO : Remove?
            console.log('stop drag')
        }

    }


    private handlePinch(event: HammerInput) {
        this.doZoom(event.center.x, event.center.y, -Math.log(event.scale))
    }


    /**
     * Performs the zoom on the map given a target and a zoom direction
     * @param targetX The mouse x coordinate (in window)
     * @param targetY The mouse y coordinate (in window)
     * @param direction >0 for zoom, <0 for unzoom
     */
    private doZoom(targetX: number, targetY: number, direction: number) {
        //TODO make it depend on the global map-width variable (not hard coded)
        const minSideSize = 10; // the maps viewbox width or height cannot be inferior to 10 points
        //TODO : Make it global?
        const scrollSpeed = 2;
        const vb = this.domManager.getViewBox()

        const visibleSVG = this.domManager.getVisibleSVG()

        const width = visibleSVG.end.x - visibleSVG.origin.x
        const height = visibleSVG.end.y - visibleSVG.origin.y
        const target = this.domManager.svgCoords(targetX, targetY);

        const scrollFactor = -this.getNormalizedDelta(direction) * scrollSpeed / 100

        const dw = width * scrollFactor
        const dh = height * scrollFactor
        const xratio = (target.x - visibleSVG.origin.x) / width
        const yratio = (target.y - visibleSVG.origin.y) / height;
        const dx = dw * xratio;
        const dy = dh * yratio;
        if (vb.width - dw >= minSideSize && vb.height - dh >= minSideSize) {

            this.domManager.setViewBox(
                vb.x + dx,
                vb.y + dy,
                vb.width - dw,
                vb.height - dh
            )
            this.zoomSubject.next();
        } else {
            console.log('zoom was forbidden')
        }

    }

    private handleWheel(event: WheelEvent) {

        this.doZoom(event.x, event.y, event.deltaY);
    }

    private getNormalizedDelta(deltaY: number) {
        return (deltaY > 0) ? 1 : -1;
    }





}