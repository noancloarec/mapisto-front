import SVG from 'svg.js';
import { Land } from '../../models/Land';
import { MapistoTerritory } from '../../models/mapistoTerritory';
import { fromEvent, Observable, Subject } from 'rxjs'
import { MapistoState } from '../../models/mapistoState';
import { debounceTime } from 'rxjs/operators';

interface Rectangle {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export class MapDomManager {

    drawing: SVG.Doc
    land_container: SVG.G;
    states_container: SVG.G;
    names_container: SVG.G
    registered_lands: {
        [id: number]: {
            precision: number,
            land: Land
        }
    }


    registered_territories: {
        [id: number]: {
            precision: number,
            territory: MapistoTerritory,
            domElement: SVG.Path,
            name: string, // actually the states'name
            color : string
        }
    }

    parentElement: HTMLDivElement
    askForNameRefresh$ : Subject<void>;

    constructor() {
        this.registered_lands = {}
        this.registered_territories = {}
        this.askForNameRefresh$ = new Subject<void>();
    }

    initMap(svgParent: HTMLDivElement, x: number, y: number, width: number, height: number) {
        this.parentElement = svgParent
        this.drawing = SVG(svgParent).viewbox(x, y, width, height);
        this.drawing.native().setAttribute("preserveAspectRatio", "xMinYMin slice");
        this.land_container = this.drawing.group().id('land-mass');
        this.states_container = this.drawing.group().id('states-container');
        this.names_container = this.drawing.group().id('names_container');
        this.askForNameRefresh$.pipe(
            debounceTime(100),
        ).subscribe(() => this.refreshNamesDisplay())
    }

    howManyPointsPerPixel() {
        const visibleSVG = this.getVisibleSVG()
        const width = visibleSVG.end.x - visibleSVG.origin.x
        const pxWidth = this.parentElement.clientWidth;
        return width / pxWidth;
    }

    getEventCoords(event: MouseEvent): DOMPoint {
        return this.svgCoords(event.clientX, event.clientY);
    }

    svgCoords(x: number, y: number): DOMPoint {
        let pt = new DOMPoint(x, y);
        return pt.matrixTransform(this.parentElement.querySelector('svg').getScreenCTM().inverse())
    }

    /**
    * Viewbox gives parts that are not visible
    */
    getVisibleSVG() {
        return {
            origin: this.svgCoords(this.parentElement.offsetLeft, this.parentElement.offsetTop),
            end: this.svgCoords(this.parentElement.offsetLeft + this.parentElement.clientWidth, this.parentElement.offsetTop + this.parentElement.clientHeight)
        }
    }



    shiftViewBox(deltaX: number, deltaY: number) {
        const viewbox = this.drawing.viewbox()
        this.setViewBox(viewbox.x + deltaX, viewbox.y + deltaY, viewbox.width, viewbox.height)
    }

    getViewBox(): SVG.ViewBox {
        return this.drawing.viewbox()
    }

    getListener(eventName: string): Observable<Event> {
        return fromEvent(this.drawing.native().parentElement, eventName)
    }

    updateLands(lands: Land[], precision: number) {
        for (const land of lands) {
            if (this.registered_lands[land.land_id] === undefined) {
                this.land_container.path(land.d_path).id('land_' + land.land_id)
                this.registered_lands[land.land_id] = {
                    land: land,
                    precision: precision
                }
            } else if (precision < this.registered_lands[land.land_id].precision) {
                // If precision smaller (so more accurate)
                const req = this.land_container.select(`#land_${land.land_id}`)
                req.first().remove();
                this.land_container.path(land.d_path).id('land_' + land.land_id)
                this.registered_lands[land.land_id].precision = precision
            }
        }
    }

    getNativeContainer() {
        return this.drawing.native().parentElement
    }

    emptyStates() {
        this.states_container.clear()
        this.names_container.clear();
        this.registered_territories = {}
    }

    setViewBox(x: number, y: number, width: number, height: number) {
        this.drawing.viewbox(x, y, width, height);
        this.askForNameRefresh$.next()
    }

    updateTerritories(state: MapistoState, precision: number) {
        let state_group = this.getStateGroup(state.state_id);
        if (state_group === undefined) {
            state_group = this.addStateGroup(state.state_id, state.color);
        }
        for (const territory of state.territories) {
            if (!this.isRegistered(territory)) {
                const path = this.addTerritoryToDOM(state_group, territory)
                this.registered_territories[territory.territory_id] = {
                    territory: territory,
                    precision: precision,
                    domElement: path,
                    name: state.name,
                    color : state.color
                }
            } else if (precision < this.registered_territories[territory.territory_id].precision) {
                // If precision smaller (so more accurate)
                this.removeTerritoryFomDOM(state_group, territory.territory_id) // remove the old, worse precision territory
                const precisePath = this.addTerritoryToDOM(state_group, territory); // add the more precise one
                this.registered_territories[territory.territory_id].precision = precision
                this.registered_territories[territory.territory_id].domElement = precisePath
            }
        }
    }

    private refreshNamesDisplay() {
        console.log('refresh name display')
        this.names_container.clear()
        const visible = this.getVisibleSVG()
        const visibleRectangle = {
            x1: visible.origin.x,
            y1: visible.origin.y,
            x2: visible.end.x,
            y2: visible.end.y
        }
        for (const id in this.registered_territories) {
            const territory = this.registered_territories[id];
            const bbox = territory.domElement.bbox()
            const bboxRect: Rectangle = {
                x1: bbox.x,
                y1: bbox.y,
                x2: bbox.x2,
                y2: bbox.y2
            }
            if (this.intersect(visibleRectangle, bboxRect) && this.getPixelSize(bbox.width) > 100) {
                const luminosity = this.getLuminosity(territory.color)
                this.names_container.text((add) => {
                    add.tspan(territory.name)
                }).attr({
                    x: bbox.x + bbox.width / 2,
                    y: bbox.y + bbox.height / 2
                }).font({
                    anchor : 'middle',
                    size : this.getNameSize(bbox)
                }).fill(luminosity > 70?'black':'white')
                // console.log('display', territory.name)
            }

        }
    }

    private getNameSize(bbox : SVG.BBox){
        return Math.max(Math.min(bbox.width, bbox.height)/10 , this.getActualViewedWidth()/50)
    }

    private getActualViewedWidth():number{
        const visible = this.getVisibleSVG()
        return visible.end.x - visible.origin.x
    }

    private intersect(a: Rectangle, b: Rectangle): boolean {
        return !(
            a.x2 < b.x1
            || b.x2 < a.x1
            || a.y2 < b.y1
            || b.y2 < a.y1
        )


    }

    private getPixelSize(svgSize: number) {
        const svg = this.parentElement.querySelector('svg');
        const matrix = svg.getScreenCTM()

        const origin = svg.createSVGPoint()
        const distant = svg.createSVGPoint()
        distant.x = svgSize

        const originPx = origin.matrixTransform(matrix)
        const ptPX = distant.matrixTransform(matrix)
        return ptPX.x - originPx.x
    }

    private addStateGroup(state_id: number, color: string): SVG.G {
        return this.states_container.group()
            .id('state_' + state_id)
            .fill(color)
            .stroke(color)
            .attr('class', 'state');
    }

    private getStateGroup(state_id: number): SVG.G {
        return this.states_container.select(`#state_${state_id}`).first() as SVG.G
    }

    private isRegistered(territory: MapistoTerritory) {
        return this.registered_territories[territory.territory_id] !== undefined
    }

    private addTerritoryToDOM(state_group: SVG.G, territory: MapistoTerritory): SVG.Path {
        this.askForNameRefresh$.next()
        return state_group.path(territory.d_path).id('territory_' + territory.territory_id)
    }

    private removeTerritoryFomDOM(state_group: SVG.G, territory_id: number) {
        const territory_to_remove = state_group.select(`#territory_${territory_id}`).first()
        territory_to_remove.remove();
    }

    private getLuminosity(color : string){
        const rgb = this.hexToRgb(color.substr(1))
        var r = rgb[0] / 255,
            g = rgb[1] / 255,
            b = rgb[2] / 255,
             y;
      
        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;
      
        y = (y > 0.008856) ? Math.pow(y, 1/3) : (7.787 * y) + 16/116;
      
        return (116 * y) - 16
      }
      private hexToRgb(hex:string) :number[]{
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;
    
        return [r, g, b];
    }
    
      

}