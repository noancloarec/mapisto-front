import { MapistoState } from "src/entities/mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import React from "react";
import { MapistoAPI } from "src/api/MapistoApi";
import { MapistoMap } from "../MapistoMap/MapistoMap";
import { FocusedSVGManager } from "./FocusedSVGManager";
import { Land } from "src/entities/Land";
import { getMapPrecision, enlargeViewBox, fitViewboxToAspectRatio } from "../MapistoMap/display-utilities";
import './FocusedMap.css';
import { Subscription } from "rxjs";

interface Props {
    year: number;
    state_id: number;
}
interface State {
    viewBoxForState: ViewBoxLike;
    statesForDisplay: MapistoState[];
    lands: Land[];
}

export class FocusedOnStateMap extends React.Component<Props, State>{

    svgManager: FocusedSVGManager;
    loadStateSubscription: Subscription;

    constructor(props: Props) {
        super(props);
        this.svgManager = new FocusedSVGManager();
        this.state = {
            viewBoxForState: null,
            statesForDisplay: [],
            lands: []
        };
    }

    shouldComponentUpdate(newProps: Props) {
        if (newProps.state_id !== this.props.state_id || newProps.year !== this.props.year) {
            this.reloadMap(newProps.state_id, newProps.year);
        }
        return true;
    }

    reloadMap(stateId: number, year: number) {
        this.loadStateSubscription = MapistoAPI.loadState(stateId, year).subscribe(
            state => {
                this.setState({ viewBoxForState: state.boundingBox }, () => {
                    const toLoad = enlargeViewBox(fitViewboxToAspectRatio(state.boundingBox, 16 / 9), 1.2);
                    this.svgManager.setViewbox(toLoad);
                    this.loadActualMap(getMapPrecision(this.svgManager), toLoad);
                });
            }
        );
    }


    componentDidMount() {
        this.reloadMap(this.props.state_id, this.props.year);
    }
    componentWillUnmount() {
        this.loadStateSubscription.unsubscribe();
    }

    loadActualMap(precision: number, toLoad: ViewBoxLike) {
        MapistoAPI.loadStates(this.props.year, precision, toLoad).subscribe(
            res => {
                this.svgManager.setFocusedTerritories(
                    res.find(mpState => mpState.stateId === this.props.state_id).territories
                );
                this.setState({ statesForDisplay: res });
            }
        );
        MapistoAPI.loadLands(precision, toLoad).subscribe(
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
                viewbox={this.state.viewBoxForState}
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