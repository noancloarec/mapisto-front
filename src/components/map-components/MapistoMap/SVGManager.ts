import { MapistoState } from 'src/entities/mapistoState';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { Svg, SVG, G, ViewBoxLike, Path } from '@svgdotjs/svg.js';
import { getVisibleSVG, howManyPointsPerPixel, translateSVGDistanceToPixel, computeTerritoryNameSize, svgCoords } from './display-utilities';
import { Land } from 'src/entities/Land';
import { Subject } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { getLabelColor } from 'src/utils/color_harmony';
import { intersect } from 'src/utils/svg_geometry';
import { Rect } from '@svgdotjs/svg.js';
export class SVGManager {
    /** The reference to the svg provided by svg.js */
    protected drawing: Svg;
    /** The G tag which contains every land PATH tags */
    private landContainer: G;
    /** The G tag which contains every state G tag */
    private statesContainer: G;
    /** The G tag which contains every name TEXT tag */
    private namesContainer: G;

    protected seaRect: Rect;

    private controlKeyIsPressed = false;

    /** A reference to the parent HTML element, used to compare svg coords with in-window pixel coords
     *  (e.g. to determine which part of the map should be loaded)
     */
    protected parentElement: HTMLDivElement;

    protected scheduleNameRefresh$: Subject<void>;

    /**
     * As getVisibleSVG makes browser rendering synchronous, its result is stored here.
     */
    private visibleSVG: ViewBoxLike;

    constructor() {
        this.scheduleNameRefresh$ = new Subject<void>();
        this.scheduleNameRefresh$.pipe(
            auditTime(300)
        ).subscribe(() => {
            this.refreshVisibleSVG();
            this.refreshNamesDisplay();
        });
    }

    /**
     * Initializes the svg map
     * @param svgParent A reference to the parent div element in the DOM, to which the map will attached
     * @param x The origin x coord
     * @param y The origin y coord
     * @param width The width (in svg coord)
     * @param height The height (in svg coord)
     */
    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike/*, onViewboxChange?: (vb: ViewBoxLike) => void*/) {
        this.parentElement = svgParent;
        this.parentElement.addEventListener('keydown', e => {
            if (e.key === 'Control') {
                this.controlKeyIsPressed = true;
            }
        });
        this.parentElement.addEventListener('keyup', e => {
            if (e.key === 'Control') {
                this.controlKeyIsPressed = false;
            }
        });
        this.parentElement.addEventListener('click', e => {
            if (this.controlKeyIsPressed) {
                console.log(svgCoords(e.clientX, e.clientY, this.parentElement));
            }
        });
        this.parentElement.innerHTML = "";
        this.drawing = SVG();
        this.drawing.addTo(this.parentElement).viewbox(vb.x, vb.y, vb.width, vb.height);
        this.drawing.attr("preserveAspectRatio", "xMidYMid");
        this.seaRect = this.drawing.rect(1e5, 1e5).move(-5e4, -5e4).fill("#d8e2eb").id("map-sea");
        this.landContainer = this.drawing.group().id('land-mass');
        this.statesContainer = this.drawing.group().id('states-container');
        this.namesContainer = this.drawing.group().id('names_container');
        this.refreshVisibleSVG();
        console.log(this.getVisibleSVG());
        // if (onViewboxChange) {
        //     onViewboxChange(getVisibleSVG(this.parentElement));
        // }
    }

    addState(mp: MapistoState) {
        const group = this.addStateGroup(mp.stateId, mp.name, mp.color);
        for (const terr of mp.territories) {
            this.addTerritoryToStateGroup(group, terr);
        }
        this.scheduleNameRefresh$.next();
    }

    clearLands() {
        this.landContainer.clear();
    }
    clearTerritories() {
        this.statesContainer.clear();
    }

    addLand(land: Land) {
        this.landContainer.path(land.d_path);
    }


    pointsPerPixel(): number {
        return howManyPointsPerPixel(this.parentElement, this.getVisibleSVG());
    }

    getVisibleSVG(): ViewBoxLike {
        return this.visibleSVG;
    }


    /**
     * Add a state groupe to the DOM
     * @param stateId The state's id
     * @param color The state's color
     */
    protected addStateGroup(stateId: number, name: string, color: string, container = this.statesContainer): G {
        return container.group()
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
    protected addTerritoryToStateGroup(stateGroup: G, territory: MapistoTerritory): Path {
        const res = stateGroup.path(territory.dPath).id('territory_' + territory.territoryId);
        return res;
    }


    /**
     * Display the names of countries on the svg.
     * Only if they are visible on the screen, and are wider than a defined threshold
     */
    protected refreshNamesDisplay(container = this.namesContainer, sourceContainer = this.statesContainer) {
        container.clear();
        for (const st of sourceContainer.children()) {
            const name = st.attr('state-name');
            for (const territoryPath of st.children()) {
                if (this.shouldDisplayName(territoryPath as Path)) {
                    this.displayName(territoryPath as Path, name, getLabelColor(st.attr('fill')), container);
                }
            }
        }
    }

    protected shouldDisplayName(territoryPath: Path): boolean {
        return this.isVisible(territoryPath) &&
            translateSVGDistanceToPixel(territoryPath.bbox().width, this.parentElement) > 100;
    }

    private displayName(territoryPath: Path, name: string, color: string, container = this.namesContainer) {
        const computedSize = computeTerritoryNameSize(territoryPath.bbox(), this.getVisibleSVG().width);
        const nameParts = name.split(' ');
        for (let i = 0; i < nameParts.length; i++) {
            container.text((add) => {
                add.tspan(nameParts[i]);
            }).attr({
                x: territoryPath.bbox().x + territoryPath.bbox().width / 2,
                y: territoryPath.bbox().y + territoryPath.bbox().height / 2 + i * computedSize
            }).font({
                anchor: 'middle',
                size: computedSize
            }).fill(color);
        }

    }

    protected refreshVisibleSVG() {
        this.visibleSVG = getVisibleSVG(this.parentElement);

    }

    private isVisible(polygon: Path): boolean {
        const bbox = polygon.bbox();
        return intersect(this.getVisibleSVG(), bbox);
    }
}