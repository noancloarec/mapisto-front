import { ViewBoxLike } from "@svgdotjs/svg.js";
import { Subject, Observable } from "rxjs";
import { MapistoPoint } from "src/entities/MapistoPoint";
import Hammer from 'hammerjs';

const minSideSize = 10;

interface DragState {
    dragging: boolean;
    viewBoxOrigin: ViewBoxLike;
}

interface PinchState {
    pinching: boolean;
    viewBoxOrigin: ViewBoxLike;
    zoomCenter: MapistoPoint;
}

export class NavigationHandler {
    private viewbox: ViewBoxLike;
    private viewBoxChange$: Subject<ViewBoxLike>;
    private sourceElement: HTMLDivElement;
    private ham: HammerManager;
    private dragState: DragState;
    private pinchState: PinchState;


    constructor(initialViewBox: ViewBoxLike, sourceElement: HTMLDivElement) {
        this.viewbox = initialViewBox;
        this.sourceElement = sourceElement;
        this.viewBoxChange$ = new Subject<ViewBoxLike>();
        this.dragState = {
            viewBoxOrigin: null,
            dragging: false
        };
        this.pinchState = {
            pinching: false,
            viewBoxOrigin: undefined,
            zoomCenter: undefined
        };
        this.ham = new Hammer(this.sourceElement, {
            touchAction: 'none'
        });
        this.viewBoxChange$.subscribe(vb => this.viewbox = vb);

        this.initListeners();

    }

    public onViewboxChange(): Observable<ViewBoxLike> {
        return this.viewBoxChange$.asObservable();
    }

    public removeListeners() {
        this.sourceElement.removeEventListener('wheel', this.wheelHandler);
        window.removeEventListener('resize', this.resizeHandler);
        this.ham.destroy();
    }

    public zoomIn() {
        this.doZoom(1.2, this.viewbox, this.getBoundingRectCenter());
    }
    public zoomOut() {
        this.doZoom(0.8, this.viewbox, this.getBoundingRectCenter());
    }

    private getBoundingRectCenter() {
        const clientRect = this.sourceElement.getBoundingClientRect()
        return { x: clientRect.width / 2, y: clientRect.height / 2 };

    }

    private wheelHandler = (event: WheelEvent) => {
        const scrollSpeed = 1.1;
        const scale = event.deltaY < 0 ? scrollSpeed : 1 / scrollSpeed;
        this.doZoom(scale, this.viewbox, { x: event.x, y: event.y });
    }

    private handlePinch(event: HammerInput) {
        if (event.eventType === Hammer.INPUT_START) {
            this.initPinch(event);
        }
        this.doZoom(event.scale, this.pinchState.viewBoxOrigin, this.pinchState.zoomCenter);
    }

    private initPinch(event: HammerInput) {
        this.pinchState = {
            pinching: true,
            viewBoxOrigin: this.viewbox,
            zoomCenter: { x: event.center.x, y: event.center.y }
        };
    }




    private initListeners() {

        this.sourceElement.addEventListener('wheel', this.wheelHandler);


        // Pan event, on mobile & desktop
        this.ham.on('pan', (e: HammerInput) => this.handlePan(e));

        // Pinch event, only on mobile
        this.ham.get('pinch').set({
            enable: true
        });
        this.ham.on('pinch', (e: HammerInput) => this.handlePinch(e));
        window.addEventListener('resize', this.resizeHandler);
    }

    private resizeHandler = () => {
        const boundingRect = this.sourceElement.getBoundingClientRect();
        const ratio = boundingRect.width / boundingRect.height;
        const newVB: ViewBoxLike = {
            ...this.viewbox,
            height: this.viewbox.width / ratio
        };
        this.viewBoxChange$.next(newVB);

    }

    private initDrag() {
        this.dragState.dragging = true;
        this.dragState.viewBoxOrigin = this.viewbox;

    }
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
        this.viewBoxChange$.next({
            ...vb,
            x: vb.x + this.getSVGDistance(-event.deltaX),
            y: vb.y + this.getSVGDistance(-event.deltaY)
        });
    }


    protected getSVGDistance(distance: number) {
        const clientRect = this.sourceElement.getBoundingClientRect();
        return distance * this.viewbox.width / clientRect.width;
    }

    private doZoom(scale: number, fromViewbox: ViewBoxLike, center: MapistoPoint) {
        const boundingRect = this.sourceElement.getBoundingClientRect();
        const width = fromViewbox.width / scale;
        const height = fromViewbox.height / scale;
        const dw = width - fromViewbox.width;
        const dh = height - fromViewbox.height;
        const xratio = (center.x - boundingRect.left) / boundingRect.width;
        const yratio = (center.y - boundingRect.top) / boundingRect.height;
        const dx = dw * xratio;
        const dy = dh * yratio;
        const x = fromViewbox.x - dx;
        const y = fromViewbox.y - dy;

        if (width >= minSideSize && height >= minSideSize) {
            const newVB = {
                x,
                y,
                width,
                height
            };

            this.viewBoxChange$.next(newVB);
        }
    }



}