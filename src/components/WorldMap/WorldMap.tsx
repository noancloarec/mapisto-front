import React, { RefObject } from "react";
import axios, { AxiosResponse } from 'axios'
import { config } from '../../config';
import { MapistoState } from "../../models/mapistoState";
import './WorldMap.css'
import { connect } from "react-redux";
import { Land } from "../../models/Land";
import { MapDomManager } from "./MapDomManager";
import { debounceTime } from 'rxjs/operators'
import { Observable, Subscription, from, Subject } from "rxjs";
import { MapNavigator } from "./MapNavigator";

interface State {
}

interface Props {
    year: number
}


class WorldMap extends React.Component<Props, State>{
    domManager: MapDomManager
    currentPrecisionLevel: number;

    serverMapSubscription: Subscription

    mapNagivator: MapNavigator

    yearChangeSubject: Subject<number>
    loading_lands = true;
    loading_territories = true;

    containerRef : RefObject<HTMLDivElement>

    constructor(props: Props) {
        super(props)
        this.domManager = new MapDomManager();
        this.yearChangeSubject = new Subject<number>();
        this.containerRef = React.createRef<HTMLDivElement>()
    }

    componentDidMount() {
        this.domManager.initMap(this.containerRef.current, 0, 0, 2269.4568, 1550.3625);
        this.mapNagivator = new MapNavigator(this.domManager);

        this.mapNagivator.getDragListener().pipe(
            debounceTime(100)
        ).subscribe(
            () => {
                this.loadLand();
                this.updateTerritories();
            }
        )

        this.mapNagivator.getZoomListener().pipe(
            debounceTime(100)
        ).subscribe(
            () => this.updatePrecisionLevel()
        )
        this.updatePrecisionLevel();
        this.loadLand();
        this.yearChangeSubject.pipe(
            debounceTime(100)
        ).subscribe(year => this.updateTime(year))
    }
    shouldComponentUpdate(newProps: Props) {
        if (newProps.year !== this.props.year) {
            this.yearChangeSubject.next(newProps.year)
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

    getClosestPrecision(kmPerPX: number) {
        return config.precision_levels.reduce(function (prev, curr) {
            return (Math.abs(curr - kmPerPX) < Math.abs(prev - kmPerPX) ? curr : prev);
        });
    }

    getKilometersPerPixel() {
        const kmPerPoint = 40000 / 2269;

        const pointPerPixels = this.domManager.howManyPointsPerPixel()

        return kmPerPoint * pointPerPixels
    }

    async loadLand() {
        const visibleSVG = this.domManager.getVisibleSVG()
        const precisionLevel = this.currentPrecisionLevel
        this.loading_lands = true;
        const res = await axios.get<Land[]>(`${config.api_path}/land`, {
            params: {
                precision_in_km: precisionLevel,
                min_x: visibleSVG.origin.x,
                max_x: visibleSVG.end.x,
                min_y: visibleSVG.origin.y,
                max_y: visibleSVG.end.y
            }
        });
        this.loading_lands = false;
        this.domManager.updateLands(res.data, precisionLevel)
    }

    load_territories(year: number, precisionLevel: number): Observable<AxiosResponse<MapistoState[]>> {
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
        )
    }
    updateTime(year: number) {
        const precisionLevel = this.currentPrecisionLevel
        if (this.serverMapSubscription) {
            this.serverMapSubscription.unsubscribe()
        }
        this.loading_territories = true;
        this.serverMapSubscription = this.load_territories(year, precisionLevel).subscribe(
            res => {
                this.domManager.emptyStates()
                for (const state of res.data) {
                    this.domManager.updateTerritories(state.territories, state.state_id, state.color, precisionLevel)
                }
            }
        )
    }

    updateTerritories() {
        const precisionLevel = this.currentPrecisionLevel
        if (this.serverMapSubscription) {
            this.serverMapSubscription.unsubscribe()
        }
        this.loading_territories = true;
        this.load_territories(this.props.year, precisionLevel).subscribe(
            res => {
                for (const state of res.data) {
                    this.domManager.updateTerritories(state.territories, state.state_id, state.color, precisionLevel)
                }
            }
        )
    }


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

const mapStateToProps = (state: { current_date: Date }): Props => ({
    year: state.current_date.getFullYear()
});

export const WorldMapConnected = connect(mapStateToProps)(WorldMap)