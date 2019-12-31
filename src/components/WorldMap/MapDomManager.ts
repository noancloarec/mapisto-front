import SVG from 'svg.js';
import { Land } from '../../models/Land';
import { MapistoTerritory } from '../../models/mapistoTerritory';
import { fromEvent, Observable } from 'rxjs'


export class MapDomManager {

    drawing: SVG.Doc
    land_container: SVG.G;
    states_container: SVG.G;
    registered_lands: {
        [id: number]: {
            precision: number,
            land: Land
        }
    }


    registered_territories: {
        [id: number]: {
            precision: number,
            territory: MapistoTerritory
        }
    }

    parentElement : HTMLDivElement

    constructor() {
        this.registered_lands = {}
        this.registered_territories = {}
    }

    initMap(svgParent: HTMLDivElement, x: number, y: number, width: number, height: number) {
        this.parentElement = svgParent
        this.drawing = SVG(svgParent).viewbox(x, y, width, height);
        this.drawing.native().setAttribute("preserveAspectRatio", "xMinYMin slice");
        this.land_container = this.drawing.group().id('land-mass');
        this.states_container = this.drawing.group().id('states-container');
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
        return pt.matrixTransform(this.getNativeContainer().querySelector('svg').getScreenCTM().inverse())
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
        this.drawing.viewbox(viewbox.x + deltaX, viewbox.y + deltaY, viewbox.width, viewbox.height)
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
        this.registered_territories = {}
    }

    setViewBox(x: number, y: number, width: number, height: number) {
        this.drawing.viewbox(x, y, width, height);
    }

    updateTerritories(territories: MapistoTerritory[], state_id: number, color: string, precision: number) {
        let state_group = this.getStateGroup(state_id);
        if (state_group === undefined) {
            state_group = this.addStateGroup(state_id, color);
        }
        for (const territory of territories) {
            if (!this.isRegistered(territory)) {
                this.addTerritoryToDOM(state_group, territory)
                this.registered_territories[territory.territory_id] = {
                    territory: territory,
                    precision: precision
                }
            } else if (precision < this.registered_territories[territory.territory_id].precision) {
                // If precision smaller (so more accurate)
                this.removeTerritoryFomDOM(state_group, territory.territory_id) // remove the old, worse precision territory
                this.addTerritoryToDOM(state_group, territory); // add the more precise one
                this.registered_territories[territory.territory_id].precision = precision
            }
        }
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

    private addTerritoryToDOM(state_group: SVG.G, territory: MapistoTerritory) {
        state_group.path(territory.d_path).id('territory_' + territory.territory_id)
    }

    private removeTerritoryFomDOM(state_group: SVG.G, territory_id: number) {
        const territory_to_remove = state_group.select(`#territory_${territory_id}`).first()
        territory_to_remove.remove();
    }

}