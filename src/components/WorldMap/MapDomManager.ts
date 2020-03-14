import SVG from 'svg.js';
import { Land } from '../../interfaces/Land';
import { MapistoTerritory } from '../../interfaces/mapistoTerritory';
import { fromEvent, Observable, Subject } from 'rxjs'
import { MapistoState } from '../../interfaces/mapistoState';
import { debounceTime } from 'rxjs/operators';
import { getLabelColor } from 'utils/color_harmony';
import { Rectangle, intersect } from 'utils/svg_geometry';



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


    /** A reference to the parent HTML element, used to compare svg coords with in-window pixel coords (e.g. to determine which part of the map should be loaded) */
    parentElement: HTMLDivElement

    /**
     * As rendering text on svg is a time-costly operation, an intermediate subject is used 
     * Every operation requiring to update countries' names (drag, zoom..) trigger the subject
     * Once the flow of triggering is over (debonceTime=100ms), the actual text rendering starts
     */
    askForNameRefresh$: Subject<void>;

    private selectedTerritory: MapistoTerritory;

    private territoryBeingClicked: MapistoTerritory;
    private territorySelection$: Subject<MapistoTerritory>

    constructor() {
        this.registered_lands = {}
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
        this.drawing.rect(1e5, 1e5).move(-5e4, -5e4).fill("#d8e2eb").click(()=> this.selectTerritory(null))
        this.land_container = this.drawing.group().id('land-mass');
        this.states_container = this.drawing.group().id('states-container');
        this.names_container = this.drawing.group().id('names_container');
        this.askForNameRefresh$.pipe(
            debounceTime(100),
        ).subscribe(() => this.refreshNamesDisplay())
    }

    getTerritorySelectionListener(): Observable<MapistoTerritory> {
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
        // this.names_container.clear();
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

    setStates(states : MapistoState[]){
        this.emptyStates();
        for(const state of states){
            const group = this.addStateGroup(state.state_id, state.name,  state.color);
            for(const territory of state.territories){
                this.addTerritoryToDOM(group, territory);
            }
        }
        this.askForNameRefresh$.next()
    }

    /**
     * Display the names of countries on the svg.
     * Only if they are visible on the screen, and are wider than a defined threshold
     */
    private refreshNamesDisplay() {
        this.names_container.clear()
        for(const st of this.states_container.children() as SVG.G[]){
            const name=st.attr('state-name')
            for(const terr of st.children() as SVG.Path[]){
                // If visible & width > threshold
                if ( this.isVisible(terr) && this.getPixelSize(terr.bbox().width) > 100) {
                    this.names_container.text((add) => {
                        add.tspan(name)
                    }).attr({
                        x: terr.bbox().x + terr.bbox().width / 2,
                        y: terr.bbox().y + terr.bbox().height / 2
                    }).font({
                        anchor: 'middle',
                        size: this.getNameSize(terr.bbox())
                    }).fill(getLabelColor(st.attr('fill')))
                }
    
            }
        }
    }

    private  isVisible(polygon:SVG.Path):boolean{
        const visible = this.getVisibleSVG()
        const visibleRectangle = {
            x1: visible.origin.x,
            y1: visible.origin.y,
            x2: visible.end.x,
            y2: visible.end.y
        }
        const bbox = polygon.bbox()
        const bboxRect: Rectangle = {
            x1: bbox.x,
            y1: bbox.y,
            x2: bbox.x2,
            y2: bbox.y2
        }
        return intersect(visibleRectangle, bboxRect)
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
    private addStateGroup(state_id: number, name : string,  color: string): SVG.G {
        return this.states_container.group()
            .id('state_' + state_id)
            .fill(color)
            .stroke(color)
            .attr('class', 'state')
            .attr('state-name', name );
    }

    /**
     * Add a territory to a state group in the DOM
     * @param state_group The state group
     * @param territory The territory to add
     */
    private addTerritoryToDOM(state_group: SVG.G, territory: MapistoTerritory): SVG.Path {
        this.askForNameRefresh$.next()
        const res = state_group.path(territory.d_path).id('territory_' + territory.territory_id)
        if (this.selectedTerritory && territory.territory_id === this.selectedTerritory.territory_id) {
            res.addClass("selected");
        }
        res.on('mousedown', () => { this.territoryBeingClicked = territory });
        res.on('mousemove', () => { this.territoryBeingClicked = null });
        res.on('mouseup', () => { this.territoryBeingClicked && this.selectTerritory(territory)  })
        return res;
    }

    private selectTerritory(territory: MapistoTerritory): void {
        this.states_container.select(`path.selected`).each((_, elemArray) => elemArray.forEach(e => e.removeClass('selected')))
        this.selectedTerritory=territory;
        this.territorySelection$.next(territory)
        if(territory){
            this.states_container.select(`#territory_${territory.territory_id}`).first().addClass("selected")
        }
    }



}