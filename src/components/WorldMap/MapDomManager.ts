import SVG from 'svg.js';
import { Land } from '../../models/Land';
import { MapistoTerritory } from '../../models/mapistoTerritory';
import { fromEvent, Observable, Subject } from 'rxjs'
import { MapistoState } from '../../models/mapistoState';
import { debounceTime } from 'rxjs/operators';

// Interface to perform some homemade geometry in the map
interface Rectangle {
    x1: number,
    y1: number,
    x2: number,
    y2: number
}

export class MapDomManager {
    /** The reference to the svg provided by svg.js */
    drawing: SVG.Doc
    /** The G tag which contains every land PATH tags */
    land_container: SVG.G;
    /** The G tag which contains every state G tag */
    states_container: SVG.G;
    /** The G tag which contains every name TEXT tag */
    names_container: SVG.G

    /** 
     * A reference collection for all land mass shape
     */
    registered_lands: {
        [id: number]: {
            precision: number,
            land: Land
        }
    }

    /**
     * A reference collection for all territory shapes
     * Somehow a duplicate of what is in the DOM (to be removed?), it was made to ease 
     */
    registered_territories: {
        [id: number]: {
            precision: number,
            territory: MapistoTerritory,
            domElement: SVG.Path, // Used to perform geometry when positioning the countries' name labels
            name: string, // actually the states'name
            color: string
        }
    }

    /** A reference to the parent HTML element, used to compare svg coords with in-window pixel coords (e.g. to determine which part of the map should be loaded) */
    parentElement: HTMLDivElement

    /**
     * As rendering text on svg is a time-costly operation, an intermediate subject is used 
     * Every operation requiring to update countries' names (drag, zoom..) trigger the subject
     * Once the flow of triggering is over (debonceTime=100ms), the actual text rendering starts
     */
    askForNameRefresh$: Subject<void>;

    private territoryBeingClicked: MapistoTerritory;
    private territorySelection$: Subject<MapistoTerritory>

    constructor() {
        this.registered_lands = {}
        this.registered_territories = {}
        this.askForNameRefresh$ = new Subject<void>();
        this.territorySelection$ = new Subject<MapistoTerritory>();
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

    getTerritorySelectionListener() : Observable<MapistoTerritory>{
        return this.territorySelection$.asObservable();
    }

    /**
     * Tells how many points lie in 1 pixel on the map
     */
    howManyPointsPerPixel(): number {
        const visibleSVG = this.getVisibleSVG()
        const width = visibleSVG.end.x - visibleSVG.origin.x
        const pxWidth = this.parentElement.clientWidth;
        return width / pxWidth;
    }

    /**
     * Returns the coord of the event within the svg point-based frame
     * @param event The mouse event
     */
    getEventCoords(event: MouseEvent): DOMPoint {
        return this.svgCoords(event.clientX, event.clientY);
    }

    /**
     * Given a point in a pixel-based frame (within the window), gives the corresponding svg coordinate
     * @param x The x coordinate (in pixel, within the window) of the point
     * @param y The y coordinate (in pixel, within the window) of the point
     */
    svgCoords(x: number, y: number): DOMPoint {
        const pt = new DOMPoint(x, y);
        return pt.matrixTransform(this.parentElement.querySelector('svg').getScreenCTM().inverse())
    }

    /**
    * Computes the top-left and right-bottom point of the visible svg (the viewbox actually does not represent what is viewed on screen)
    */
    getVisibleSVG() {
        return {
            origin: this.svgCoords(this.parentElement.offsetLeft, this.parentElement.offsetTop),
            end: this.svgCoords(this.parentElement.offsetLeft + this.parentElement.clientWidth, this.parentElement.offsetTop + this.parentElement.clientHeight)
        }
    }
    /**
     * Translates the viewbox by a given vector (x, y)
     * @param deltaX X translation in point
     * @param deltaY Y translation in point
     */
    shiftViewBox(deltaX: number, deltaY: number) {
        const viewbox = this.drawing.viewbox()
        this.setViewBox(viewbox.x + deltaX, viewbox.y + deltaY, viewbox.width, viewbox.height)
    }

    /**
     * Returns the svg's viewbox
     */
    getViewBox(): SVG.ViewBox {
        return this.drawing.viewbox()
    }

    /**
     * Given an event name, returns an observable listener for it on the div element which contains the svg tag (the svg itself cannot be listened)
     * @param eventName The name of the event to listen to (ex : 'wheel')
     */
    getListener(eventName: string): Observable<Event> {
        return fromEvent(this.drawing.native().parentElement, eventName)
    }

    /**
     * Updates the land data with the new informations
     * @param lands The lands to add to the map
     * @param precision The associated precision
     */
    updateLands(lands: Land[], precision: number) {
        for (const land of lands) {
            /**
             * Either
             * 1. The Land to add is new to the map --> it is added
             * 2. The Land is known, but the new representation has a better precision --> it is redrawn, and the precision is updated
             * 3. The Land is known, but the new representation has a worse precision --> Nothing is done
             */
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

    /**
     * Returns the div html container of the SVG
     */
    getNativeContainer() {
        return this.drawing.native().parentElement
    }

    /**
     * Removes all states
     */
    emptyStates() {
        this.states_container.clear()
        this.names_container.clear();
        this.registered_territories = {}
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
        this.askForNameRefresh$.next()
    }

    /**
     * Update the territories of a state on the map
     * @param state A state, usually obtained from the sever
     * @param precision the associated precision with the state
     */
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
                    color: state.color
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

    /**
     * Display the names of countries on the svg.
     * Only if they are visible on the screen, and are wider than a defined threshold
     */
    private refreshNamesDisplay() {
        this.names_container.clear()
        const visible = this.getVisibleSVG()
        const visibleRectangle = {
            x1: visible.origin.x,
            y1: visible.origin.y,
            x2: visible.end.x,
            y2: visible.end.y
        }
        for (const id in this.registered_territories) {
            // Displaying the name on each territory if visible and wide enough 
            const territory = this.registered_territories[id];
            const bbox = territory.domElement.bbox()
            const bboxRect: Rectangle = {
                x1: bbox.x,
                y1: bbox.y,
                x2: bbox.x2,
                y2: bbox.y2
            }
            // If visible & width > threshold
            if (this.intersect(visibleRectangle, bboxRect) && this.getPixelSize(bbox.width) > 100) {
                const luminosity = this.getLuminosity(territory.color)
                this.names_container.text((add) => {
                    add.tspan(territory.name)
                }).attr({
                    x: bbox.x + bbox.width / 2,
                    y: bbox.y + bbox.height / 2
                }).font({
                    anchor: 'middle',
                    size: this.getNameSize(bbox)
                }).fill(luminosity > 70 ? 'black' : 'white')
                // console.log('display', territory.name)
            }

        }
    }
    /**
     * Determines the size of a text label, as a compromise between the width, height of bbox, and map width
     * @param bbox the territory's bbox
     */
    private getNameSize(bbox: SVG.BBox) {
        return Math.max(Math.min(bbox.width, bbox.height) / 10, this.getActualViewedWidth() / 50)
    }

    private getActualViewedWidth(): number {
        const visible = this.getVisibleSVG()
        return visible.end.x - visible.origin.x
    }

    /**
     * Tells if 2 rectangle have an intersecting area
     * @param a Rectangle a
     * @param b Rectangle
     */
    private intersect(a: Rectangle, b: Rectangle): boolean {
        return !(
            a.x2 < b.x1
            || b.x2 < a.x1
            || a.y2 < b.y1
            || b.y2 < a.y1
        )
    }

    /**
     * Given a size in point (svg frame), computes the on-screen size in pixels
     * @param svgSize the size in points
     */
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

    /**
     * Add a state groupe to the DOM
     * @param state_id The state's id
     * @param color The state's color
     */
    private addStateGroup(state_id: number, color: string): SVG.G {
        return this.states_container.group()
            .id('state_' + state_id)
            .fill(color)
            .stroke(color)
            .attr('class', 'state');
    }

    /**
     * Returns a state group given the state id
     * @param state_id The state's group
     */
    private getStateGroup(state_id: number): SVG.G {
        return this.states_container.select(`#state_${state_id}`).first() as SVG.G
    }

    /**
     * Tells if a territory has been registered in the DOM checking its id
     * @param territory The territory to search
     */
    private isRegistered(territory: MapistoTerritory) {
        return this.registered_territories[territory.territory_id] !== undefined
    }

    /**
     * Add a territory to a state group in the DOM
     * @param state_group The state group
     * @param territory The territory to add
     */
    private addTerritoryToDOM(state_group: SVG.G, territory: MapistoTerritory): SVG.Path {
        this.askForNameRefresh$.next()
        const res = state_group.path(territory.d_path).id('territory_' + territory.territory_id)
        res.on('mousedown', () => { this.territoryBeingClicked = territory });
        res.on('mousemove', () => { this.territoryBeingClicked = null });
        res.on('mouseup', () => { this.territoryBeingClicked && this.territorySelection$.next(territory) })
        return res;
    }

    /**
     * Remove a territory from the DOM
     * @param state_group The state group from which the territory should be removed
     * @param territory_id The id of the territory to remove
     */
    private removeTerritoryFomDOM(state_group: SVG.G, territory_id: number) {
        const territory_to_remove = state_group.select(`#territory_${territory_id}`).first()
        territory_to_remove.remove();
    }

    /**
     * Compute the L (luminosity) parameter of the LaB representation of an RGB pixel
     * Used to determine if the name f the country should be written white (if territory color is dark) or  black (if territory color is light)
     * @param color 
     */
    private getLuminosity(color: string) {
        const rgb = this.hexToRgb(color.substr(1))
        var r = rgb[0] / 255,
            g = rgb[1] / 255,
            b = rgb[2] / 255,
            y;

        r = (r > 0.04045) ? Math.pow((r + 0.055) / 1.055, 2.4) : r / 12.92;
        g = (g > 0.04045) ? Math.pow((g + 0.055) / 1.055, 2.4) : g / 12.92;
        b = (b > 0.04045) ? Math.pow((b + 0.055) / 1.055, 2.4) : b / 12.92;
        y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000;

        y = (y > 0.008856) ? Math.pow(y, 1 / 3) : (7.787 * y) + 16 / 116;

        return (116 * y) - 16
    }

    /**
     * Computes the RGB representation of an hexadecimal color
     * @param hex The hex representation of the color
     */
    private hexToRgb(hex: string): number[] {
        var bigint = parseInt(hex, 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        return [r, g, b];
    }



}