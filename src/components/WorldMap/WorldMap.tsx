import React, { RefObject } from "react";
import { config } from 'src/config';
import { MapistoState } from "src/interfaces/mapistoState";
import './WorldMap.css';
import { connect } from "react-redux";
import { MapDomManager } from "./MapDomManager";
import { debounceTime, tap } from 'rxjs/operators';
import { MapNavigator } from "./MapNavigator";
import { updateLoadingLandStatus, updateLoadingTerritoryStatus, selectTerritory, updateMpStates, updateLands } from "src/store/actions";
import { MapistoTerritory } from "src/interfaces/mapistoTerritory";
import { RootState } from "src/store/reducer";
import { loadStates, loadLands } from "../../api/MapistoApi";
import { Land } from "src/interfaces/Land";
import { getVisibleSVG, howManyPointsPerPixel } from "./displayUtilities";

interface StateProps {
    year: number;
    selectedTerritory: MapistoTerritory;
    mpStates: MapistoState[];
    lands: Land[];
}
interface DispatchProps {
    updateLoadingLandStatus: (loadingLand: boolean) => void;
    updateLoadingTerritoryStatus: (loadingLand: boolean) => void;
    selectTerritory: (territory: MapistoTerritory) => void;
    updateMpStates: (mpStates: MapistoState[]) => void;
    updateLands: (lands: Land[]) => void;
}

type Props = StateProps & DispatchProps;
/**
 * Wrapper React Component for the WorldMap in mapisto.
 * Its own DOM is updated via svg.js (not react, which is too slow to
 * render the hundreds of svg elements with great interactivity)
 */
class WorldMap extends React.Component<Props, {}>{
    /**
     * The domManager is in charge of managing HTML elements inside the world map.
     */
    domManager: MapDomManager;

    /**
     * Defines the zoom level of the map
     */
    currentPrecisionLevel: number;

    /**
     * Handles the mouse events which will redefine the viewbox of the svg containing the map.
     */
    mapNagivator: MapNavigator;


    /**
     * A reference to the parent of the SVG. To be given to mapDomManager so it can create the SVG map
     */
    containerRef: RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.domManager = new MapDomManager();
        this.containerRef = React.createRef<HTMLDivElement>();
    }

    /**
     * Does the first rendering of the map, initializes the listeners
     */
    componentDidMount() {

        // Coordinates of the map are hard-coded. They represents the bounds of the map on the server
        this.domManager.initMap(this.containerRef.current, 0, 0, 2269.4568, 1550.3625);
        this.mapNagivator = new MapNavigator(this.domManager);
        this.adaptMapToPrecision();

        this.mapNagivator.getDragListener().pipe(
            debounceTime(100) // debounce time to reload the map only at the end of drag
        ).subscribe(
            () => this.updateMap()
        );

        this.mapNagivator.getZoomListener().subscribe(
            () => this.adaptMapToPrecision()
        );

        this.domManager.getTerritorySelectionListener().subscribe(territory => this.props.selectTerritory(territory));

    }

    /**
     * Forbids React to re-render the world map
     * @param newProps the new props provided by redux to the WorldMap
     */
    shouldComponentUpdate(newProps: Props) {
        if (newProps.year !== this.props.year) {
            this.updateTerritories(newProps.year);
        } if (newProps.mpStates !== this.props.mpStates) {
            this.domManager.setStates(newProps.mpStates);
        } if (newProps.lands !== (this.props.lands)) {
            this.domManager.setLands(newProps.lands);
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
        return config.precision_levels.reduce(function (prev, curr) {
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
        this.props.updateLoadingLandStatus(true);
        loadLands(
            this.currentPrecisionLevel,
            visibleSVG.origin.x,
            visibleSVG.end.x,
            visibleSVG.origin.y,
            visibleSVG.end.y
        ).pipe(
            tap(() => this.props.updateLoadingLandStatus(false))
        )
            .subscribe(
                lands => this.props.updateLands(lands)
            );
    }

    /**
     * Loads the territories' borders from the server
     * @param year The year to load
     * @param precisionLevel The necessary precision level
     */
    private updateTerritories(year = this.props.year): void {
        const visibleSVG = getVisibleSVG(this.domManager.parentElement);
        this.props.updateLoadingTerritoryStatus(true);
        loadStates(
            year,
            this.currentPrecisionLevel,
            visibleSVG.origin.x,
            visibleSVG.end.x,
            visibleSVG.origin.y,
            visibleSVG.end.y
        ).pipe(
            tap(() => this.props.updateLoadingTerritoryStatus(false))
        )
            .subscribe(
                states => this.props.updateMpStates(states)
            );
    }

    render() {
        return (
            <div className="map" ref={this.containerRef}>
            </div>
        );
    }
}

/**
 * Maps the redux state to the props of the world map
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): StateProps => ({
    year: state.current_date.getFullYear(),
    selectedTerritory: state.selectedTerritory,
    mpStates: state.mpStates,
    lands: state.lands
});

export const WorldMapConnected = connect(mapStateToProps, {
    updateLoadingLandStatus, updateLoadingTerritoryStatus, selectTerritory, updateMpStates, updateLands
 })(WorldMap);