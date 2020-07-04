import React from 'react';
import { viewboxAsString } from '../display-utilities';
import { TerritoriesGroup } from '../TerritoriesGroup/TerritoriesGroup';
import { LandsGroup } from '../LandsGroup/LandsGroup';
import { Subscription, interval } from 'rxjs';
import { PlayPauseOverlay } from './PlayPauseOverlay';
import { MapData } from 'src/api/MapData';
import { NamesGroup } from '../NamesGroup/NamesGroup';

interface Props {
    maps: MapData[];
}
interface State {
    currentMapIndex: number;
    playing: boolean;
}
export class GifMap extends React.Component<Props, State>{
    private timerSubscription: Subscription;
    constructor(props: Props) {
        super(props);
        this.timerSubscription = new Subscription();
        this.state = {
            playing: false,
            currentMapIndex: 0,
        };
    }
    componentWillUnmount() {
        this.timerSubscription.unsubscribe();
    }

    render() {
        const currentMap = this.getCurrentMap()

        return (
            <div className="map">
                <PlayPauseOverlay playing={this.state.playing} onChange={() => this.playOrPause()} />
                <div className="year-display">
                    <div className="row">
                        <div className="col-4 col-lg-2 year-box">
                            {(currentMap.date.getUTCFullYear())}
                        </div>
                    </div>
                </div>
                <svg viewBox={viewboxAsString(currentMap.boundingBox)}>
                    <TerritoriesGroup
                        date={currentMap.date}
                        territories={currentMap.territories}
                        strokeWidth={currentMap.boundingBox.width ** .5 / 30}
                    />
                    <LandsGroup lands={[]} />
                    <NamesGroup
                        territories={currentMap.territories}
                        date={currentMap.date}
                        viewbox={currentMap.boundingBox}
                    />
                </svg>
            </div>
        );
    }
    playOrPause(): void {
        if (this.state.playing) {
            this.timerSubscription.unsubscribe();
        } else {
            this.timerSubscription = interval(1000).subscribe(
                () => this.setState({
                    currentMapIndex: (this.state.currentMapIndex + 1) % this.props.maps.length
                }));
        }
        this.setState({
            playing: !this.state.playing
        });
    }

    private getCurrentMap() {
        return this.props.maps[this.state.currentMapIndex];
    }
}
