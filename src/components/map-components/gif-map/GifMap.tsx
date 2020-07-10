import React from 'react';
import { viewboxAsString } from '../display-utilities';
import { TerritoriesGroup } from '../TerritoriesGroup/TerritoriesGroup';
import { LandsGroup } from '../LandsGroup/LandsGroup';
import { Subscription, interval } from 'rxjs';
import { PlayPauseOverlay } from './PlayPauseOverlay';
import { NamesGroup } from '../NamesGroup/NamesGroup';
import { MapDataWithLands } from 'src/api/MapDataWithLands';

interface Props {
    maps: MapDataWithLands[];
    autoPlay : boolean
}
interface State {
    currentMapIndex: number;
    playing: boolean;
}
export class GifMap extends React.Component<Props, State>{
    private timerSubscription: Subscription;
    public static defaultProps = {
        autoPlay : true
    }
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

    componentDidMount(){
        if (this.props.autoPlay){
            this.playOrPause()
        }

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
                    <LandsGroup lands={currentMap.lands} />
                    <TerritoriesGroup
                        date={currentMap.date}
                        territories={currentMap.territories}
                        strokeWidth={currentMap.boundingBox.width ** .5 / 30}
                    />
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
        console.log('trigger play')
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
