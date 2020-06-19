import { MapistoState } from "src/entities/mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import React, { RefObject } from "react";
import { MapistoAPI } from "src/api/MapistoApi";
import { Land } from "src/entities/Land";
import { viewboxAsString } from "../MapistoMap/display-utilities";
import './FocusedMap.css';
import { Subscription, forkJoin, interval } from "rxjs";
import { TerritoriesGroup } from "../TerritoriesGroup/TerritoriesGroup";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { LoadingIcon } from "../TimeNavigableMap/LoadingIcon";
import { TimeSelector } from "../TimeNavigableMap/TimeSelector";
import { LandsGroup } from "../LandsGroup/LandsGroup";
import { GifMap } from "../gif-map/GifMap";

interface Props {
    mpState: MapistoState;
}
interface State {
    currentMpState: MapistoState;

    mapStates: {
        year: number;
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
        if (prevProps.mpState.stateId !== this.props.mpState.stateId) {
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
        const years = this.generateYearsToDisplay(this.props.mpState);
        const pixelWidth = this.mapRef.current.getBoundingClientRect().width;
        forkJoin(years.map(y => MapistoAPI.loadMapForState(this.props.mpState.stateId, y, pixelWidth))).subscribe(
            res => this.setState({
                mapStates: res.map((mapState, index) => ({
                    territories: mapState.territories,
                    viewbox: mapState.boundingBox,
                    year: years[index],
                    lands: []
                })),
                currentMpState: this.props.mpState
            })
        );
    }

    private generateYearsToDisplay(mpState: MapistoState): number[] {
        const years = [mpState.startYear];
        if (mpState.endYear > mpState.startYear + 2) {
            years.push(Math.round((mpState.endYear - mpState.startYear) / 2) + mpState.startYear);
        }
        if (mpState.endYear > mpState.startYear + 1) {
            years.push(mpState.endYear - 1);
        }

        return years;

    }

}