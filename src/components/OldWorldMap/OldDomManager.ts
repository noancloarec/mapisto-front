import SVG from 'svg.js';
import { Land } from '../../interfaces/Land';
import { MapistoTerritory } from '../../interfaces/mapistoTerritory';
import { fromEvent, Observable, Subject } from 'rxjs';
import { MapistoState } from '../../interfaces/mapistoState';
import { getLabelColor } from 'src/utils/color_harmony';
import { Rectangle, intersect } from 'src/utils/svg_geometry';
import { getVisibleSVG, getActualViewedWidth, translateSVGDistanceToPixel, svgCoords } from './OlddisplayUtilities';
import { debounceTime } from 'rxjs/operators';



export class DomManager {
    /** The reference to the svg provided by svg.js */
    drawing: SVG.Doc;
    /** The G tag which contains every land PATH tags */
    landContainer: SVG.G;
    /** The G tag which contains every state G tag */
    statesContainer: SVG.G;
    /** The G tag which contains every name TEXT tag */
    namesContainer: SVG.G;

    focusedStateContainer: SVG.G;

    /** A reference to the parent HTML element, used to compare svg coords with in-window pixel coords
     *  (e.g. to determine which part of the map should be loaded)
     */
    parentElement: HTMLDivElement;

    /**
     * As rendering text on svg is a time-costly operation, an intermediate subject is used
     * Every operation requiring to update countries' names (drag, zoom..) trigger the subject
     * Once the flow of triggering is over (debonceTime=100ms), the actual text rendering starts
     */
    askForNameRefresh$: Subject<void>;


    constructor() {
        this.askForNameRefresh$ = new Subject<void>();
    }

    /**
     * Initializes the svg map
     * @param svgParent A reference to the parent div element in the DOM, to which the map will attached
     * @param x The origin x coord
     * @param y The origin y coord
     * @param width The width (in svg coord)
     * @param height The height (in svg coord)
     */
    initMap(svgParent: HTMLDivElement, x: number, y: number, width: number, height: number) {
        this.parentElement = svgParent;
        this.drawing = SVG(svgParent).viewbox(x, y, width, height);
        this.drawing.native().setAttribute("preserveAspectRatio", "xMidYMid");
        this.drawing.rect(1e5, 1e5).move(-5e4, -5e4).fill("#d8e2eb").id("map-sea");
        this.landContainer = this.drawing.group().id('land-mass');
        this.statesContainer = this.drawing.group().id('states-container');
        this.namesContainer = this.drawing.group().id('names_container');
        this.focusedStateContainer = this.drawing.group().id('focused-state-container');

        this.askForNameRefresh$.pipe(
            debounceTime(100),
        ).subscribe(() => this.refreshNamesDisplay());
    }

    /**
     * Translates the viewbox by a given vector (x, y)
     * @param deltaX X translation in point
     * @param deltaY Y translation in point
     */
    shiftViewBox(deltaX: number, deltaY: number) {
        const viewbox = this.drawing.viewbox();
        this.setViewBox(viewbox.x + deltaX, viewbox.y + deltaY, viewbox.width, viewbox.height);
    }

    /**
     * Returns the svg's viewbox
     */
    getViewBox(): SVG.ViewBox {
        return this.drawing.viewbox();
    }


    /**
     * Removes all states
     */
    emptyStates() {
        this.statesContainer.clear();
    }

    /**
     * Sets the SVG viewbox coordinates, Asks to update the state's names display
     * @param x new x
     * @param y new y
     * @param width new width
     * @param height new height
     */
    setViewBox(x: number, y: number, width: number, height: number) {
        this.drawing.viewbox(x, y, width, height);
        this.askForNameRefresh$.next();
    }

    setStates(states: MapistoState[]) {
        this.emptyStates();
        for (const state of states) {
            const group = this.addStateGroup(state.state_id, state.name, state.color);
            for (const territory of state.territories) {
                this.addTerritoryToDOM(group, territory);
            }
        }
        this.askForNameRefresh$.next();
    }

    focusOnState(state: MapistoState) {
        const rect = this.focusedStateContainer.rect(1e5, 1e5).move(-5e4, -5e4);
        const group = this.addStateGroup(state.state_id, state.name, state.color, this.focusedStateContainer);
        for (const territory of state.territories) {
            this.addTerritoryToDOM(group, territory);
        }
        this.setViewBox(
            group.bbox().x,
            group.bbox().y,
            group.bbox().width,
            group.bbox().height
        );
        this.addNameForState(group, this.focusedStateContainer);
    }

    setLands(lands: Land[]) {
        this.landContainer.clear();
        for (const land of lands) {
            this.landContainer.path(land.d_path);
        }
    }

    /**
     * Display the names of countries on the svg.
     * Only if they are visible on the screen, and are wider than a defined threshold
     */
    private refreshNamesDisplay() {
        this.namesContainer.clear();
        for (const st of this.statesContainer.children() as SVG.G[]) {
            this.addNameForState(st);
        }
    }

    private addNameForState(
        stateGroup: SVG.G,
        container = this.namesContainer): void {
        for (const terr of stateGroup.children() as SVG.Path[]) {
            // If visible & width > threshold
            if (this.isVisible(terr) && translateSVGDistanceToPixel(terr.bbox().width, this.parentElement) > 100) {
                container.text((add) => {
                    add.tspan(stateGroup.attr('state-name'));
                }).attr({
                    x: terr.bbox().x + terr.bbox().width / 2,
                    y: terr.bbox().y + terr.bbox().height / 2
                }).font({
                    anchor: 'middle',
                    size: this.computeTerritoryNameSize(terr.bbox())
                }).fill(getLabelColor(stateGroup.attr('fill')));
            }

        }

    }

    private isVisible(polygon: SVG.Path): boolean {
        const visible = getVisibleSVG(this.parentElement);
        const visibleRectangle = {
            x1: visible.origin.x,
            y1: visible.origin.y,
            x2: visible.end.x,
            y2: visible.end.y
        };
        const bbox = polygon.bbox();
        const bboxRect: Rectangle = {
            x1: bbox.x,
            y1: bbox.y,
            x2: bbox.x2,
            y2: bbox.y2
        };
        return intersect(visibleRectangle, bboxRect);
    }

    /**
     * Determines the size of a text label, as a compromise between the width, height of bbox, and map width
     * @param bbox the territory's bbox
     */
    private computeTerritoryNameSize(bbox: SVG.BBox) {
        return Math.max(Math.min(bbox.width, bbox.height) / 10, getActualViewedWidth(this.parentElement) / 50);
    }

    /**
     * Add a state groupe to the DOM
     * @param stateId The state's id
     * @param color The state's color
     */
    private addStateGroup(stateId: number, name: string, color: string, destination = this.statesContainer): SVG.G {
        return destination.group()
            .id('state_' + stateId)
            .fill(color)
            .stroke(color)
            .attr('class', 'state')
            .attr('state-name', name);
    }

    /**
     * Add a territory to a state group in the DOM
     * @param stateGroup The state group
     * @param territory The territory to add
     */
    private addTerritoryToDOM(stateGroup: SVG.G, territory: MapistoTerritory): SVG.Path {
        const res = stateGroup.path(territory.d_path).id('territory_' + territory.territory_id);
        this.askForNameRefresh$.next();
        return res;
    }

}