import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { viewboxAsString } from '../MapistoMap/display-utilities';
import { TimeSelector } from '../TimeNavigableMap/TimeSelector';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { TerritoriesGroup } from '../TerritoriesGroup/TerritoriesGroup';
import { LandsGroup } from '../LandsGroup/LandsGroup';
import { Subscription, interval } from 'rxjs';
import { PlayPauseOverlay } from './PlayPauseOverlay';

interface Props {
    maps: {
        territories: MapistoTerritory[],
        year: number,
        viewbox: ViewBoxLike
    }[];
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
        return (
            <div className="map">
                <PlayPauseOverlay playing={this.state.playing} onChange={() => this.playOrPause()} />
                <div className="year-display">
                    <div className="row">
                        <div className="col-4 col-lg-2 year-box">
                            {this.getCurrentMap().year}
                        </div>
                    </div>
                </div>
                <svg viewBox={viewboxAsString(this.getCurrentMap().viewbox)}>
                    <TerritoriesGroup
                        year={this.getCurrentMap().year}
                        territories={this.getCurrentMap().territories}
                        strokeWidth={this.getCurrentMap().viewbox.width ** .5 / 30}
                    />
                    <LandsGroup lands={[]} />
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
