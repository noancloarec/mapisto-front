import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { MapistoMap } from 'src/components/map-components/MapistoMap/MapistoMap';
import { NavigableSVGManager } from './NavigableSVGManager';
import { Land } from 'src/entities/Land';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { MapistoAPI } from 'src/api/MapistoApi';
import { getMapPrecision } from '../MapistoMap/display-utilities';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { RootState } from 'src/store';
import { connect } from 'react-redux';

interface OwnProps {
    year: number;
    svgManager: NavigableSVGManager;
    onStatesLoaded: () => void;
}

interface StateProps {
    mapVersion: string;
}
type Props = StateProps & OwnProps;
interface State {
    mpStates: MapistoState[];
    lands: Land[];
    viewbox: ViewBoxLike;
}
class NavigableMapUnconnected extends React.Component<Props, State>{
    scheduleRefresh$: Subject<ViewBoxLike>;
    public static defaultProps = {
        svgManager: new NavigableSVGManager()
    };
    private mapSubscription: Subscription;

    constructor(props: Props) {
        super(props);
        this.state = {
            mpStates: [],
            lands: [],
            viewbox: {
                x: 0, y: 0, width: 1000, height: 1000
            }
        };
        this.scheduleRefresh$ = new Subject<ViewBoxLike>();
        this.scheduleRefresh$.pipe(
            debounceTime(300)
        ).subscribe(vb => this.loadMap(vb));

        this.props.svgManager.attachOnZoomOrPan(vb => {
            this.setState({ viewbox: vb })
            this.scheduleRefresh$.next(vb)
        });
    }


    render() {
        return (
            <MapistoMap
                SVGManager={this.props.svgManager}
                lands={this.state.lands}
                mpStates={this.state.mpStates}
                viewbox={this.state.viewbox}
            >

            </MapistoMap>
        );
    }

    componentDidMount() {
        this.scheduleRefresh$.next(this.props.svgManager.getViewBox());
    }

    shouldComponentUpdate(nextProps: Props, nextState: State) {
        if (nextProps.year !== this.props.year) {
            this.loadStates(
                nextProps.year,
                this.props.svgManager.getViewBox(),
                getMapPrecision(this.props.svgManager)
            );
        }
        if (nextProps.mapVersion !== this.props.mapVersion) {
            this.loadStates(
                nextProps.year, this.props.svgManager.getViewBox(), getMapPrecision(this.props.svgManager), true
            );
        }
        return nextState !== this.state;
    }




    private loadMap(vb: ViewBoxLike) {
        const precision = getMapPrecision(this.props.svgManager);
        this.loadStates(this.props.year, vb, precision);
        this.loadLands(vb, precision);
    }



    private loadStates(year: number, vb: ViewBoxLike, precision: number, eraseCache = false) {
        if (this.mapSubscription) {
            this.mapSubscription.unsubscribe();
        }
        this.mapSubscription = MapistoAPI.loadStates(year, precision, vb)
            .subscribe(
                res => {
                    const newStates = eraseCache ? res : this.reduceStates(this.state.mpStates, res);
                    this.setState({ mpStates: newStates }, () => this.props.onStatesLoaded());
                }
            );
    }

    private loadLands(vb: ViewBoxLike, precision: number) {
        MapistoAPI.loadLands(precision, vb).subscribe(
            res => {

                const newLands = this.reduceLands(this.state.lands, res);
                this.setState({
                    lands: newLands
                });
            }
        );
    }

    private reduceStates(
        baseStates: MapistoState[],
        newStates: MapistoState[]):
        MapistoState[] {


        const knownStates = baseStates.filter(s => !s.isOutdated(this.props.year));
        for (const knownState of knownStates) {
            const newState = newStates.find(n => n.stateId === knownState.stateId);
            knownState.territories = this.reduceTerritories(
                knownState.territories, newState ? newState.territories : []
            );
            if (newState) {
                knownState.name = newState.name;
            }
        }
        const unknownYetStates = newStates.filter(
            n => knownStates.findIndex(known => known.stateId === n.stateId) === -1
        );
        return [...knownStates, ...unknownYetStates];

    }

    private reduceTerritories(
        baseTerritories: MapistoTerritory[],
        newTerritories: MapistoTerritory[]): MapistoTerritory[] {

        const territoriesMorePrecise = baseTerritories.filter(t => !t.isOutdated(this.props.year));
        // console.log(`After remove outdated from ${this.props.year} : `, territoriesMorePrecise)
        for (let i = 0; i < territoriesMorePrecise.length; i++) {
            const baseTerritory = territoriesMorePrecise[i];
            const newTerritory = newTerritories.find(t => t.territoryId === baseTerritory.territoryId);
            if (newTerritory) {
                territoriesMorePrecise[i].validityStart = newTerritory.validityStart;
                territoriesMorePrecise[i].validityEnd = newTerritory.validityEnd;
                if (newTerritory.precisionLevel < baseTerritory.precisionLevel) {
                    territoriesMorePrecise[i] = newTerritory;
                }
            }
        }
        const unknownYetTerritories = newTerritories.filter(
            t => baseTerritories.findIndex(baseT => baseT.territoryId === t.territoryId) === -1
        );

        return [...territoriesMorePrecise, ...unknownYetTerritories];
    }

    private reduceLands(oldLands: Land[], newLands: Land[]): Land[] {
        const landsMorePrecise = [...oldLands];
        for (let i = 0; i < landsMorePrecise.length; i++) {
            const baseLand = landsMorePrecise[i];
            const newLand = newLands.find(land => land.land_id === baseLand.land_id);
            if (newLand && newLand.precision_level < baseLand.precision_level) {
                landsMorePrecise[i] = newLand;
            }
        }
        const unknownYetLands = newLands.filter(
            land => oldLands.findIndex(baseLand => baseLand.land_id === land.land_id) === -1
        );
        return [...landsMorePrecise, ...unknownYetLands];

    }

}

const mapStateToProps = (state: RootState): StateProps => ({
    mapVersion: state.edition.mapVersion
});
export const NavigableMap = connect(mapStateToProps)(NavigableMapUnconnected);