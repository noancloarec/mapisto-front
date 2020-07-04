import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoAPI } from 'src/api/MapistoApi';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { LoadingIcon } from '../../loading-icon/LoadingIcon';
import { forkJoin, Subscription } from 'rxjs';
import { GifMap } from '../gif-map/GifMap';
import { MapData } from 'src/api/MapData';

interface Props {
    territory: MapistoTerritory;
}
interface State {
    maps: MapData[];
    currentMapIndex: number;
    playing: boolean;
    viewbox: ViewBoxLike;
}
export class FocusedOnTerritoryMap extends React.Component<Props, State>{
    private mapRef: React.RefObject<HTMLDivElement>;
    private loadMapSubscripton: Subscription;
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
                <GifMap maps={this.state.maps.map(m => ({ ...m, viewbox: this.state.viewbox }))} />
            );
        } else {
            return <LoadingIcon loading={true} />;
        }
    }

    private loadMap() {
        const years = this.generateYearsToDisplay(this.props.territory);
        const pixelWidth = this.mapRef.current.getBoundingClientRect().width;
        this.loadMapSubscripton = forkJoin(years.map(y =>
            MapistoAPI.loadMapForTerritory(this.props.territory.territoryId, y, pixelWidth))).subscribe(
                res => this.setState({
                    maps: res,
                    viewbox: res[0].boundingBox
                })
            );
    }

    private generateYearsToDisplay(territory: MapistoTerritory): number[] {
        const years = [territory.startYear];
        if (territory.endYear > territory.startYear + 1) {
            years.push(territory.endYear - 1);
        }

        return years;

    }
}
