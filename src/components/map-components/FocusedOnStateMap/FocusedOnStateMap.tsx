import { MapistoState } from "src/entities/mapistoState";
import React, { RefObject } from "react";
import { MapistoAPI } from "src/api/MapistoApi";
import { Subscription } from "rxjs";
import { LoadingIcon } from "../../loading-icon/LoadingIcon";
import { GifMap } from "../gif-map/GifMap";
import { MapData } from "src/api/MapData";

interface Props {
    mpState: MapistoState;
}
interface State {
    currentMpState: MapistoState;

    mapStates: MapData[];
}

export class FocusedOnStateMap extends React.Component<Props, State>{

    private mapRef: RefObject<HTMLDivElement>;
    private mapSubscription: Subscription;

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
    componentWillUnmount() {
        this.mapSubscription.unsubscribe();
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
        this.mapSubscription = MapistoAPI.loadGifMapForState(this.props.mpState.stateId, pixelWidth).subscribe(
            res => this.setState({
                mapStates: res,
                currentMpState: this.props.mpState
            })
        );
    }
}