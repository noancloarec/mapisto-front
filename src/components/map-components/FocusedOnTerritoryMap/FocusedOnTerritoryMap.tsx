import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoAPI } from 'src/api/MapistoApi';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { LoadingIcon } from '../../loading-icon/LoadingIcon';
import { forkJoin, Subscription } from 'rxjs';
import { GifMap } from '../gif-map/GifMap';
import { MapDataWithLands } from 'src/api/MapDataWithLands';

interface Props {
    territory: MapistoTerritory;
    autoPlay: boolean;
}
interface State {
    maps: MapDataWithLands[];
    currentMapIndex: number;
    playing: boolean;
    viewbox: ViewBoxLike;
}
export class FocusedOnTerritoryMap extends React.Component<Props, State>{
    private mapRef: React.RefObject<HTMLDivElement>;
    private loadMapSubscripton: Subscription;
    public static defaultProps = {
        autoPlay: true
    };
    constructor(props: Props) {
        super(props);
        this.mapRef = React.createRef<HTMLDivElement>();
        this.state = {
            playing: false,
            maps: [],
            currentMapIndex: 0,
            viewbox: { x: 0, y: 0, width: 0, height: 0 }

        };
    }

    componentDidMount() {
        this.loadMap();
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.territory.territoryId !== this.props.territory.territoryId) {
            this.loadMap();
        }
    }

    componentWillUnmount() {
        this.loadMapSubscripton.unsubscribe();
    }

    render() {
        return <div ref={this.mapRef}>
            {this.renderMap()}
        </div>;
    }

    renderMap() {
        if (this.state.maps.length) {

            return (
                <GifMap autoPlay={this.props.autoPlay}
                    maps={this.state.maps} />
            );
        } else {
            return <LoadingIcon loading={true} />;
        }
    }

    private loadMap() {
        const dates = [this.props.territory.validityStart];
        if (this.props.territory.endYear > this.props.territory.startYear + 1) {
            dates.push(this.props.territory.validityEnd);
        }
        const pixelWidth = this.mapRef.current.getBoundingClientRect().width;
        this.loadMapSubscripton = forkJoin(dates.map(d =>
            MapistoAPI.loadMapForTerritory(this.props.territory.territoryId, d, pixelWidth))).subscribe(
                res => this.setState({
                    maps: res,
                    viewbox: res[0].boundingBox
                })
            );
    }
}
