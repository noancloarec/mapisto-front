import React, { RefObject } from "react";
import { config } from 'src/config';
import { DomManager } from "./OldDomManager";
import { loadStates, loadLands } from "../../api/MapistoApi";
import { getVisibleSVG, howManyPointsPerPixel } from "./OlddisplayUtilities";
import { MapistoState } from "src/interfaces/mapistoState";
import './OldWorldMap.css';
import { MapistoViewBox } from "src/interfaces/mapistoViewBox";


export interface Props {
    year: number;
    focusedState: MapistoState;
}
/**
 * Wrapper React Component for the WorldMap in mapisto.
 * Its own DOM is updated via svg.js (not react, which is too slow to
 * render the hundreds of svg elements with great interactivity)
 */
export class WorldMap extends React.Component<Props, {}>{
    public static defaultProps = {
        viewbox: {
            x: 0,
            y: 0,
            width: 2269.4568,
            height: 1550.3625
        }
    };

    /**
     * The domManager is in charge of managing HTML elements inside the world map.
     */
    domManager: DomManager;

    /**
     * Defines the zoom level of the map
     */
    currentPrecisionLevel: number;


    /**
     * A reference to the parent of the SVG. To be given to mapDomManager so it can create the SVG map
     */
    containerRef: RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.domManager = new DomManager();
        this.containerRef = React.createRef<HTMLDivElement>();
    }

    /**
     * Does the first rendering of the map, initializes the listeners
     */
    componentDidMount() {
        // Coordinates of the map are hard-coded. They represents the bounds of the map on the server
        this.domManager.initMap(
            this.containerRef.current,
            this.props.focusedState.bounding_box.x,
            this.props.focusedState.bounding_box.y,
            this.props.focusedState.bounding_box.width,
            this.props.focusedState.bounding_box.height
        );
        this.adaptMapToPrecision();
    }

    /**
     * Forbids React to re-render the world map
     * @param newProps the new props provided by redux to the WorldMap
     */
    shouldComponentUpdate(newProps: Props) {
        if (newProps.year !== this.props.year) {
            this.updateTerritories(newProps.year);
        }
        return false;
    }

    private updateMap() {
        this.updateTerritories();
        this.updateLands();
    }


    private adaptMapToPrecision() {
        const closestPrecision = this.getClosestPrecision(3 * this.getKilometersPerPixel());
        if (closestPrecision !== this.currentPrecisionLevel) {
            this.currentPrecisionLevel = closestPrecision;
            this.updateMap();
        }
    }

    /**
     * Mapisto only has a few levels of precision
     * (i.e. precision to ask to the server). Defined in config.precision_levels
     * This function returns the first precision levels that satisfy the number of kilometers per pixels
     * @param kmPerPX the number of kilometer per pixel on the map
     */
    private getClosestPrecision(kmPerPX: number): number {
        return config.precision_levels.reduce((prev, curr) => {
            return (Math.abs(curr - kmPerPX) < Math.abs(prev - kmPerPX) ? curr : prev);
        });
    }

    /**
     * Computes the number of kilometers represented in 1 pixel on the map.
     */
    private getKilometersPerPixel(): number {
        // the svg has a point-based coordinate system
        const kmPerPoint = 40000 / 2269;

        // A pixel (on screen) represents a number of points
        const pointPerPixels = howManyPointsPerPixel(this.domManager.parentElement);

        return kmPerPoint * pointPerPixels;
    }


    private updateLands(): void {
        const visibleSVG = getVisibleSVG(this.domManager.parentElement);
        loadLands(
            this.currentPrecisionLevel,
            visibleSVG.origin.x,
            visibleSVG.end.x,
            visibleSVG.origin.y,
            visibleSVG.end.y
        ).subscribe(
            lands => this.domManager.setLands(lands)
        );
    }

    /**
     * Loads the territories' borders from the server
     * @param year The year to load
     * @param precisionLevel The necessary precision level
     */
    private updateTerritories(year = this.props.year): void {
        const visibleSVG = getVisibleSVG(this.domManager.parentElement);
        console.log(visibleSVG)
        loadStates(
            year,
            this.currentPrecisionLevel,
            visibleSVG.origin.x,
            visibleSVG.end.x,
            visibleSVG.origin.y,
            visibleSVG.end.y
        ).subscribe(
            states => {
                this.domManager.setStates(states);
                this.domManager.focusOnState(states.find(s => s.state_id === this.props.focusedState.state_id));
            }
        );
    }

    render() {
        return (
            <div className="map" ref={this.containerRef}>
            </div>
        );
    }
}
