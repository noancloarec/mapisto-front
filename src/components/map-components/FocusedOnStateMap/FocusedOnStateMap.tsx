import { MapistoState } from "src/entities/mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import React, { RefObject } from "react";
import { MapistoAPI } from "src/api/MapistoApi";
import { Land } from "src/entities/Land";
import './FocusedMap.css';
import { forkJoin } from "rxjs";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { LoadingIcon } from "../TimeNavigableMap/LoadingIcon";
import { GifMap } from "../gif-map/GifMap";
import { map } from "rxjs/operators";

interface Props {
    mpState: MapistoState;
}
interface State {
    currentMpState: MapistoState;

    mapStates: {
        date: Date;
        viewbox: ViewBoxLike;
        territories: MapistoTerritory[];
        lands: Land[];
    }[];
}

export class FocusedOnStateMap extends React.Component<Props, State>{

    private mapRef: RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.mapRef = React.createRef();
        this.state = {
            currentMpState: undefined,
            mapStates: [],
        };
    }

    componentDidMount() {
        this.loadMap();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.mpState !== this.props.mpState) {
            this.loadMap();
        }
    }

    render() {
        return <div ref={this.mapRef}>
            {this.renderMap()}
        </div>;
    }
    renderMap() {
        if (this.state.currentMpState && this.props.mpState.stateId === this.state.currentMpState.stateId) {

            return (
                <GifMap maps={this.state.mapStates} />
            );
        } else {
            return <LoadingIcon loading={true} />;
        }
    }

    private loadMap() {
        const pixelWidth = this.mapRef.current.getBoundingClientRect().width;
        MapistoAPI.loadGifMapForState(this.props.mpState.stateId, pixelWidth).subscribe(
            res => this.setState({
                mapStates: res.map(map => ({
                    date: map.date,
                    viewbox: map.boundingBox,
                    territories: map.territories,
                    lands: [],
                }))
                ,
                currentMpState: this.props.mpState
            })
        );
    }
}