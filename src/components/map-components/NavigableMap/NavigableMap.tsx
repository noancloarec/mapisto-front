import React, { KeyboardEvent } from 'react';
import { Land } from 'src/entities/Land';
import { ViewBoxLike, Svg } from '@svgdotjs/svg.js';
import { MapistoAPI } from 'src/api/MapistoApi';
import { getMapPrecision, svgCoords, viewboxAsString } from '../MapistoMap/display-utilities';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { LandsGroup } from '../LandsGroup/LandsGroup';
import { NavigationHandler } from './NavigationHandler';
import { MapistoPoint } from 'src/entities/MapistoPoint';
import { TerritoriesGroup } from '../TerritoriesGroup/TerritoriesGroup';
import { dateFromYear, yearToISOString } from 'src/utils/date_utils';

interface Props {
    year: number;
    initialWidth: number;
    initialCenter: MapistoPoint;
    onTerritoriesLoaded: () => void;
    onKeyDown?: (event: KeyboardEvent<HTMLDivElement>) => void;
    onTerritoryClicked?: (territory: MapistoTerritory) => void;
}

interface State {
    territories: MapistoTerritory[];
    lands: Land[];
    viewbox: ViewBoxLike;
    yearOnDisplay: number; // Different than props.year while props.year is still loading
    territoryBeingPressed: MapistoTerritory;
}
export class NavigableMap extends React.Component<Props, State>{
    navigationHandler: NavigationHandler;
    private mapSubscription: Subscription;
    private mapContainer: React.RefObject<HTMLDivElement>;
    public static defaultProps = {
        onTerritoriesLoaded: () => { return; }
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            territories: [],
            lands: [],
            viewbox: { x: 0, y: 0, width: 0, height: 0 },
            yearOnDisplay: this.props.year,
            territoryBeingPressed: undefined
        };
        this.mapContainer = React.createRef();
    }


    render() {
        return (
            <div
                className="map"
                tabIndex={0}
                ref={this.mapContainer}
                onKeyDown={this.props.onKeyDown}
                onClick={(ev) => console.log(svgCoords(ev.clientX, ev.clientY, this.mapContainer.current))}
                onMouseUp={() =>
                    this.state.territoryBeingPressed && this.props.onTerritoryClicked(this.state.territoryBeingPressed)
                }
                onMouseMove={() => this.setState({ territoryBeingPressed: undefined })}
            >
                <svg viewBox={viewboxAsString(this.state.viewbox)}>
                    <rect x={-1000} y={-1000} width={4260} height={3500}
                        onClick={() => this.props.onTerritoryClicked(undefined)}
                        fill="transparent"
                    ></rect>
                    <LandsGroup lands={this.state.lands} />
                    <TerritoriesGroup
                        onTerritoryPressed={t => this.setState({ territoryBeingPressed: t })}
                        territories={this.state.territories}
                        date={dateFromYear(this.state.yearOnDisplay)}
                        strokeWidth={this.state.viewbox.width ** .5 / 30} />
                </svg>
            </div>
        );
    }

    componentDidMount() {
        const initialViewBox = this.computeFirstViewbox();
        this.setState({ viewbox: initialViewBox });
        this.navigationHandler = new NavigationHandler(initialViewBox, this.mapContainer.current);
        this.navigationHandler.onViewboxChange().subscribe(vb =>
            this.setState({
                viewbox: vb
            })
        );
        this.navigationHandler.onViewboxChange().pipe(
            debounceTime(500)
        ).subscribe(vb => this.loadMap(vb, this.props.year));
        this.loadMap(initialViewBox, this.props.year);

    }

    componentWillUnmount() {
        this.navigationHandler.removeListeners();
    }

    shouldComponentUpdate(newProps: Props) {
        if (newProps.year !== this.props.year) {
            this.loadMap(this.state.viewbox, newProps.year);
            return false;
        } else {
            return true;
        }
    }

    /**
     * Computes the initial viewbox according to the maps proportion
     */
    private computeFirstViewbox(): ViewBoxLike {
        const boundingRect = this.mapContainer.current.getBoundingClientRect();
        const ratio = boundingRect.width / boundingRect.height;
        const vbHeight = this.props.initialWidth / ratio;
        return {
            x: this.props.initialCenter.x - this.props.initialWidth / 2,
            y: this.props.initialCenter.y - vbHeight / 2,
            width: this.props.initialWidth,
            height: vbHeight
        };
    }

    private loadMap(vb: ViewBoxLike, year: number) {
        const pxWidth = this.mapContainer.current.getBoundingClientRect().width;
        const precision = getMapPrecision(vb.width / pxWidth);
        this.loadTerritories(year, vb, precision);
        this.loadLands(vb, precision);
    }



    private loadTerritories(year: number, vb: ViewBoxLike, precision: number) {
        if (this.mapSubscription) {
            this.mapSubscription.unsubscribe();
        }
        this.mapSubscription = MapistoAPI.loadMap(year, precision, vb)
            .subscribe(
                res => {
                    this.props.onTerritoriesLoaded();
                    this.setState({
                        territories: this.reduceTerritories(this.state.territories, res.territories, year),
                        yearOnDisplay: year
                    });
                }
            );
    }

    private loadLands(vb: ViewBoxLike, precision: number) {
        MapistoAPI.loadLands(precision, vb).subscribe(
            res => {
                this.setState({
                    lands: this.reduceLands(this.state.lands, res)
                });
            });
    }


    private reduceLands(existingLands: Land[], newLands: Land[]) {
        const landsNotUpdated = existingLands.filter(l => newLands.find(n => n.land_id === l.land_id) === undefined);
        return newLands.concat(landsNotUpdated);
    }
    private reduceTerritories(
        existingTerritories: MapistoTerritory[],
        newTerritories: MapistoTerritory[],
        year: number
    ) {
        const date = dateFromYear(year);
        console.log('sorted all so they are between ', date, 'and next year, (year=', year, ')')
        const territoriesNotUpdated = existingTerritories.filter(
            t => t.validAt(date) && newTerritories.find(n => n.territoryId === t.territoryId) === undefined
        );
        return newTerritories.concat(territoriesNotUpdated);
    }
}

