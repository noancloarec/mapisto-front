import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoMap } from '../MapistoMap/MapistoMap';
import { FocusedSVGManager } from '../FocusedOnStateMap/FocusedSVGManager';
import { MapistoState } from 'src/entities/mapistoState';
import { Land } from 'src/entities/Land';
import { MapistoAPI } from 'src/api/MapistoApi';
import { getMapPrecision } from '../MapistoMap/display-utilities';
import '../FocusedOnStateMap/FocusedMap.css';

interface Props {
    territory: MapistoTerritory;
    year: number;
    svgManager?: FocusedSVGManager;
}
interface State {
    mpStates: MapistoState[];
    lands: Land[];
}
export class FocusedOnTerritoryMap extends React.Component<Props, State>{
    private svgManager: FocusedSVGManager;
    constructor(props: Props) {
        super(props);
        if (this.props.svgManager) {
            console.log(this.props.svgManager)
            this.svgManager = this.props.svgManager;
        } else {
            this.svgManager = new FocusedSVGManager();
        }

        this.state = {
            mpStates: [],
            lands: []
        };
    }

    componentDidMount() {
        this.updateMap(this.props.territory, this.props.year);
    }
    shouldComponentUpdate(newProps: Props, nextState: State) {
        if (newProps.territory !== this.props.territory || this.props.year !== newProps.year) {
            this.updateMap(newProps.territory, newProps.year);
            return false;
        }
        return true;
    }


    render() {
        return <MapistoMap
            SVGManager={this.svgManager}
            initialViewbox={this.props.territory.boundingBox}
            mpStates={this.state.mpStates}
            lands={this.state.lands}
        >

        </MapistoMap>;
    }

    private updateMap(territory: MapistoTerritory, year: number) {
        this.svgManager.setFocusedTerritories([territory]);
        this.svgManager.focusViewbox(territory.boundingBox, 4 / 3);
        const precision = getMapPrecision(this.svgManager);
        MapistoAPI.loadStates(
            year, precision, this.svgManager.getVisibleSVG()
        ).subscribe(
            states =>
                this.setState({
                    mpStates: states
                })
        );
        MapistoAPI.loadLands(precision, this.svgManager.getVisibleSVG()).subscribe(
            res => this.setState({
                lands: res
            })
        );

    }
}