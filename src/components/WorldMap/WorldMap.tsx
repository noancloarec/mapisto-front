import React, { RefObject } from "react";
import axios, { AxiosResponse } from 'axios'
import { config } from '../../config';
import { MapistoState } from "@interfaces/mapistoState";
import './WorldMap.css'
import { connect } from "react-redux";
import { Land } from "@interfaces/Land";
import { MapDomManager } from "./MapDomManager";
import { debounceTime, tap } from 'rxjs/operators'
import { Observable, Subscription, from, Subject } from "rxjs";
import { MapNavigator } from "./MapNavigator";
import { updateLoadingLandStatus, updateLoadingTerritoryStatus,  selectTerritory, updateMpStates} from '../../store/actions'
import { MapistoTerritory } from "@interfaces/mapistoTerritory";
import { RootState } from "store/reducer";

interface StateProps {
    year: number,
    selectedTerritory : MapistoTerritory,
    mpStates : MapistoState[]
}
interface DispatchProps {
    updateLoadingLandStatus: (loadingLand: boolean) => void,
    updateLoadingTerritoryStatus: (loadingLand: boolean) => void,
    selectTerritory: (territory : MapistoTerritory) => void,
    updateMpStates : (mpStates : MapistoState[]) => void
}

type Props = StateProps & DispatchProps
/**
 * Wrapper React Component for the WorldMap in mapisto.
 * Its own DOM is updated via svg.js (not react, which is too slow to render the hundreds of svg elements with great interactivity)
 */
class WorldMap extends React.Component<Props, {}>{
    /**
     * The domManager is in charge of managing HTML elements inside the world map.
     */
    domManager: MapDomManager

    /**
     * Defines the zoom level of the map
     */
    currentPrecisionLevel: number;

    /**
     * The subscription made to the server to load the map
     */
    serverMapSubscription: Subscription

    /**
     * Handles the mouse events which will redefine the viewbox of the svg containing the map.
     */
    mapNagivator: MapNavigator

    /**
     * A reference to the parent of the SVG. To be given to mapDomManager so it can create the SVG map
     */
    containerRef: RefObject<HTMLDivElement>

    constructor(props: Props) {
        super(props)
        this.domManager = new MapDomManager();
        this.containerRef = React.createRef<HTMLDivElement>()
    }

    /**
     * Does the first rendering of the map, initializes the listeners
     */
    componentDidMount() {

        // Coordinates of the map are hard-coded. They represents the bounds of the map on the server
        this.domManager.initMap(this.containerRef.current, 0, 0, 2269.4568, 1550.3625);
        this.mapNagivator = new MapNavigator(this.domManager);

        this.mapNagivator.getDragListener().pipe(
            debounceTime(100) // debounce time to reload the map only at the end of drag
        ).subscribe(
            () => {
                this.loadLand();
                this.updateTerritories();
            }
        )

        this.mapNagivator.getZoomListener().pipe(
            debounceTime(100) // debounce time to reload only at the end of zoom
        ).subscribe(
            () => this.updatePrecisionLevel()
        )

        this.domManager.getTerritorySelectionListener().subscribe(territory => this.props.selectTerritory(territory))

        this.updatePrecisionLevel();
        this.loadLand();
    }

    /**
     * Forbids React to render the world map unless the year has changed
     * @param newProps the new props provided by redux to the WorldMap
     */
    shouldComponentUpdate(newProps: Props) {
        if (newProps.year !== this.props.year) {
            this.updateTime(newProps.year)
        }
        return false;
    }


    updatePrecisionLevel() {
        const closestPrecision = this.getClosestPrecision(3 * this.getKilometersPerPixel());
        if (closestPrecision !== this.currentPrecisionLevel) {
            this.currentPrecisionLevel = closestPrecision;
            this.loadLand()
            this.updateTerritories()
        }

    }

    /**
     * Mapisto only has a few levels of precision (i.e. precision to ask to the server). Defined in config.precision_levels
     * This function returns the first precision levels that satisfy the number of kilometers per pixels
     * @param kmPerPX the number of kilometer per pixel on the map
     */
    getClosestPrecision(kmPerPX: number): number {
        return config.precision_levels.reduce(function (prev, curr) {
            return (Math.abs(curr - kmPerPX) < Math.abs(prev - kmPerPX) ? curr : prev);
        });
    }

    /**
     * Computes the number of kilometers represented in 1 pixel on the map.
     */
    getKilometersPerPixel(): number {
        // the svg has a point-based coordinate system
        const kmPerPoint = 40000 / 2269;

        // A pixel (on screen) represents a number of points
        const pointPerPixels = this.domManager.howManyPointsPerPixel()

        return kmPerPoint * pointPerPixels
    }

    /**
     * Loads the land-shapes from the server. Then makes the dommanager update the map
     */
    async loadLand() {
        const visibleSVG = this.domManager.getVisibleSVG()
        const precisionLevel = this.currentPrecisionLevel
        this.props.updateLoadingLandStatus(true)
        // TODO: Handle errors, make observable
        const res = await axios.get<Land[]>(`${config.api_path}/land`, {
            params: {
                precision_in_km: precisionLevel,
                min_x: visibleSVG.origin.x,
                max_x: visibleSVG.end.x,
                min_y: visibleSVG.origin.y,
                max_y: visibleSVG.end.y
            }
        });
        this.props.updateLoadingLandStatus(false);
        this.domManager.updateLands(res.data, precisionLevel)
    }

    /**
     * Loads the territories' borders from the server
     * @param year The year to load
     * @param precisionLevel The necessary precision level
     */
    load_territories(year: number, precisionLevel: number): Observable<AxiosResponse<MapistoState[]>> {
        // TODO: handle errors, make analogous to loadLand
        const visibleSVG = this.domManager.getVisibleSVG()

        return from(
            axios.get<MapistoState[]>(`${config.api_path}/map`, {
                params: {
                    date: year + "-01-01",
                    precision_in_km: precisionLevel,
                    min_x: visibleSVG.origin.x,
                    max_x: visibleSVG.end.x,
                    min_y: visibleSVG.origin.y,
                    max_y: visibleSVG.end.y
                }
            })
        ).pipe(
            tap(res => this.props.updateMpStates(res.data))
        )
    }
    /**
     * Updates the borders' map given a change in the date
     * @param year The new year on the map
     */
    updateTime(year: number) {
        const precisionLevel = this.currentPrecisionLevel
        if (this.serverMapSubscription) {
            // If a previous year was being loaded, let's forget it so that it does not conflict with the new one
            this.serverMapSubscription.unsubscribe()
        }
        this.props.updateLoadingTerritoryStatus(true);
        this.serverMapSubscription = this.load_territories(year, precisionLevel).subscribe(
            res => {
                this.props.updateLoadingTerritoryStatus(false)
                // The states representing the previous year are removed only once the request is done
                this.domManager.emptyStates()
                for (const state of res.data) {
                    this.domManager.updateTerritories(state, precisionLevel)
                }
            }
        )
    }

    /**
     * Update the territories' borders when the year hasn't changed (e.g. on drag)
     * Basically Does the same as update time, but without removing the previous borders data
     */
    updateTerritories() {
        const precisionLevel = this.currentPrecisionLevel
        if (this.serverMapSubscription) {
            this.serverMapSubscription.unsubscribe()
        }
        this.props.updateLoadingTerritoryStatus(true);
        this.load_territories(this.props.year, precisionLevel).subscribe(
            res => {
                this.props.updateLoadingTerritoryStatus(false)
                for (const state of res.data) {
                    this.domManager.updateTerritories(state, precisionLevel)
                }
            }
        )
    }

    /**
     * Selects a state to display further information
     * @param id the id of the state to select
     */
    selectState(id: number) {
        alert('selected text with id' + id)
    }

    render() {
        console.log('MAP RENDERING')
        return (
            <div className="map" ref={this.containerRef}>
            </div>
        )
    }
}

/**
 * Maps the redux state to the props of the world map
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): StateProps => ({
    year: state.current_date.getFullYear(),
    selectedTerritory : state.selectedTerritory,
    mpStates : state.mpStates
});

export const WorldMapConnected = connect(mapStateToProps, { updateLoadingLandStatus, updateLoadingTerritoryStatus, selectTerritory , updateMpStates})(WorldMap)