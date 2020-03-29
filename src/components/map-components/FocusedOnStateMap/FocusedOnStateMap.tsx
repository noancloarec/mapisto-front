import { MapistoState } from "src/entities/mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import React from "react";
import { MapistoAPI } from "src/api/MapistoApi";
import { MapistoMap } from "../MapistoMap/MapistoMap";
import { FocusedSVGManager } from "./FocusedSVGManager";
import { Land } from "src/entities/Land";
import { getMapPrecision } from "../MapistoMap/display-utilities";
import './FocusedMap.css';

interface Props {
    year: number;
    state_id: number;
}
interface State {
    viewBoxForState: ViewBoxLike;
    statesForDisplay: MapistoState[];
    lands: Land[];
}

const MIN_ASPECT_RATIO = 4 / 3;
export class FocusedOnStateMap extends React.Component<Props, State>{

    svgManager: FocusedSVGManager;

    constructor(props: Props) {
        super(props);
        this.svgManager = new FocusedSVGManager();
        this.state = {
            viewBoxForState: null,
            statesForDisplay: [],
            lands: []
        };
    }



    componentDidMount() {
        MapistoAPI.loadState(this.props.state_id, this.props.year).subscribe(
            state => {
                this.setState({ viewBoxForState: state.boundingBox }, () => {
                    const vb = this.svgManager.focusViewbox(state.boundingBox, MIN_ASPECT_RATIO);
                    this.loadActualMap(vb, getMapPrecision(this.svgManager));
                });
            }
        );
    }

    loadActualMap(vb: ViewBoxLike, precision: number) {
        MapistoAPI.loadStates(this.props.year, precision, vb).subscribe(
            res => {
                this.svgManager.setFocusedTerritories(
                    res.find(mpState => mpState.stateId === this.props.state_id).territories
                );
                this.setState({ statesForDisplay: res });
            }
        );
        MapistoAPI.loadLands(precision, vb).subscribe(
            res => {
                this.setState({
                    lands: res
                });
            }
        );
    }

    render() {
        if (this.state.viewBoxForState) {
            return <MapistoMap
                mpStates={this.state.statesForDisplay}
                SVGManager={this.svgManager}
                lands={this.state.lands}
                initialViewbox={this.state.viewBoxForState}
            />;
        } else {
            return (
                <div>
                    Loading
            </div>
            );
        }
    }

}