import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoMap } from '../MapistoMap/MapistoMap';
import { FocusedSVGManager } from '../FocusedOnStateMap/FocusedSVGManager';
import { MapistoState } from 'src/entities/mapistoState';
import { Land } from 'src/entities/Land';
import { MapistoAPI } from 'src/api/MapistoApi';
import { getMapPrecision } from '../MapistoMap/display-utilities';
import '../FocusedOnStateMap/FocusedMap.css';
import { ViewBoxLike } from '@svgdotjs/svg.js';

interface Props {
    territory: MapistoTerritory;
    year: number;
}
interface State {
    mpStates: MapistoState[];
    lands: Land[];
}
export class FocusedOnTerritoryMap extends React.Component<Props, State>{
    svgManager: FocusedSVGManager;
    private computedViewbox: ViewBoxLike;
    constructor(props: Props) {
        super(props);
        this.svgManager = new FocusedSVGManager();

        this.state = {
            mpStates: [],
            lands: []
        };
    }

    componentDidMount() {
        this.updateMap(this.props.territory);
    }
    shouldComponentUpdate(newProps: Props, nextState: State) {
        console.log(nextState)
        if (newProps.territory !== this.props.territory) {
            this.updateMap(newProps.territory);
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

    private updateMap(territory: MapistoTerritory) {
        this.svgManager.setFocusedTerritories([territory]);
        this.computedViewbox = this.svgManager.focusViewbox(territory.boundingBox, 4 / 3);
        console.log({ computed: this.computedViewbox, visible: this.svgManager.getVisibleSVG() })
        const precision = getMapPrecision(this.svgManager);
        MapistoAPI.loadStates(
            this.props.year, precision, this.svgManager.getVisibleSVG()
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