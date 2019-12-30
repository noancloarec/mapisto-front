import { MapDomManager } from "./MapDomManager";
import { Subject } from "rxjs";

export class MapNavigator {
    private domManager: MapDomManager
    private draggingSubject: Subject<void>
    private dragStartPoint: DOMPoint;
    private dragging: boolean;

    private zoomSubject: Subject<void>

    constructor(domManager: MapDomManager) {
        this.domManager = domManager
        this.draggingSubject = new Subject<void>();
        this.zoomSubject = new Subject<void>();
        this.domManager.getListener('mousedown').subscribe(event => this.startDragging(event as MouseEvent));
        this.domManager.getListener('touchmove').subscribe(event => this.startDragging(event as MouseEvent));
        this.domManager.getListener('mouseup').subscribe(() => this.endDragging());
        this.domManager.getListener('mouseleave').subscribe(() => this.endDragging());
        this.domManager.getListener('mousemove').subscribe((event) => this.handleDrag(event as MouseEvent));

        this.domManager.getListener('wheel').subscribe(zoomEvent => this.handleZoom(zoomEvent as WheelEvent))

    }

    getDragListener() {
        return this.draggingSubject.asObservable();
    }

    getZoomListener() {
        return this.zoomSubject.asObservable();
    }

    private startDragging(event: MouseEvent) {
        console.log(event)
        
        this.dragStartPoint = this.domManager.getEventCoords(event);
        this.dragging = true
    }

    private endDragging() {
        this.dragging = false;
    }

    private handleDrag(event: MouseEvent) {
        if (!this.dragging) {
            return
        }
        let targetPoint = this.domManager.getEventCoords(event);
        this.domManager.shiftViewBox(this.dragStartPoint.x - targetPoint.x,
            this.dragStartPoint.y - targetPoint.y);
        this.draggingSubject.next();
    }

    private handleZoom(event: WheelEvent) {
        const minSideSize = 10; // the maps viewbox width or height cannot be inferior to 10 points
        const scrollSpeed = 2;
        const vb = this.domManager.getViewBox()

        const visibleSVG = this.domManager.getVisibleSVG()

        const width = visibleSVG.end.x - visibleSVG.origin.x
        const height = visibleSVG.end.y - visibleSVG.origin.y
        const target = this.domManager.getEventCoords(event);

        const scrollFactor = -this.getNormalizedDelta(event) * scrollSpeed / 100

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

    private getNormalizedDelta(evt: WheelEvent) {
        return (evt.detail < 0 || evt.deltaY > 0) ? 1 : -1;
    }





}