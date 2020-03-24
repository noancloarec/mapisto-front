import { MapistoState } from 'src/interfaces/mapistoState';
import { MapistoTerritory } from 'src/interfaces/mapistoTerritory';
import { Svg, SVG, G, ViewBoxLike, Path, Rect } from '@svgdotjs/svg.js'
export class SVGManager {
    /** The reference to the svg provided by svg.js */
    drawing: Svg;
    /** The G tag which contains every land PATH tags */
    landContainer: G;
    /** The G tag which contains every state G tag */
    statesContainer: G;
    /** The G tag which contains every name TEXT tag */
    namesContainer: G;

    focusedStateContainer: G;

    /** A reference to the parent HTML element, used to compare svg coords with in-window pixel coords
     *  (e.g. to determine which part of the map should be loaded)
     */
    parentElement: HTMLDivElement;


    /**
     * Initializes the svg map
     * @param svgParent A reference to the parent div element in the DOM, to which the map will attached
     * @param x The origin x coord
     * @param y The origin y coord
     * @param width The width (in svg coord)
     * @param height The height (in svg coord)
     */
    public initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        this.parentElement = svgParent;
        this.drawing = SVG().addTo(this.parentElement).toSvg().viewbox(vb.x, vb.y, vb.width, vb.height);
        this.drawing.attr("preserveAspectRatio", "xMidYMid");
        this.drawing.rect().move(-5e4, -5e4).fill("#d8e2eb").id("map-sea");
        this.landContainer = this.drawing.group().id('land-mass');
        this.statesContainer = this.drawing.group().id('states-container');
        this.namesContainer = this.drawing.group().id('names_container');
    }

    public addState(mp: MapistoState) {
        const group = this.addStateGroup(mp.state_id, mp.name, mp.color);
        for (const terr of mp.territories) {
            this.addTerritoryToStateGroup(group, terr);
        }
    }

    /**
     * Add a state groupe to the DOM
     * @param stateId The state's id
     * @param color The state's color
     */
    private addStateGroup(stateId: number, name: string, color: string): G {
        return this.statesContainer.group()
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
    private addTerritoryToStateGroup(stateGroup: G, territory: MapistoTerritory): Path {
        const res = stateGroup.path(territory.d_path).id('territory_' + territory.territory_id);
        return res;
    }



}