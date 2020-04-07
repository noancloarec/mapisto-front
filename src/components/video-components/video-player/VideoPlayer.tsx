import React, { Key } from 'react';
import { Scene } from 'src/entities/Scene';
import { MapistoAPI } from 'src/api/MapistoApi';
import { VideoMap } from 'src/components/map-components/VideoMap/VideoMap';
import { range, zip, timer, Observable, Subscription } from 'rxjs';
import { TimeSelector } from 'src/components/map-components/TimeNavigableMap/TimeSelector';
import './VideoPlayer.css';
import { ControlBar } from '../control-bar/ControlBar';
import { Link } from 'react-router-dom';

interface Props {
    stateId: number;
}
interface State {
    scenery: Scene[];
    currentYear: number;
    paused: boolean;
}
export class VideoPlayer extends React.Component<Props, State>{
    private yearEmitter$: Observable<number>;
    private yearSubscription: Subscription;
    constructor(props: Props) {
        super(props);
        this.state = {
            scenery: undefined,
            currentYear: undefined,
            paused: true
        };
    }

    render() {
        if (this.state.scenery) {
            const scene = this.getCurrentScene();
            return (
                <div className="video-player">
                    <div className="video-time-display">
                        <TimeSelector year={this.state.currentYear} />
                        <Link
                            className="time-link"
                            to={`/?year=${this.state.currentYear}&x=${scene.bbox.x}&y=${scene.bbox.y}&width=${scene.bbox.width}&height=${scene.bbox.height}`}
                        />
                    </div>
                    <VideoMap scenery={this.state.scenery} year={this.state.currentYear} />
                    <ControlBar
                        year={this.state.currentYear}
                        onYearChange={y => this.setVideoAt(y)}
                        paused={this.state.paused}
                        onPause={() => this.state.paused ? this.unPause() : this.pause()}
                        start={this.state.scenery[0].startYear}
                        end={this.state.scenery[this.state.scenery.length - 1].endYear}
                    />
                </div>
            );

        } else {
            return <p>Loading</p>;
        }
    }

    componentDidMount() {
        MapistoAPI.getVideo(this.props.stateId).subscribe(
            scenery => this.setState({
                scenery
            }, () => {
                this.setVideoAt(scenery[0].startYear);
                this.unPause();
            })
        );
        window.addEventListener('keydown', this.handleSpacePress);
    }
    componentWillUnmount() {
        window.removeEventListener('keydown', this.handleSpacePress);
        if (this.yearSubscription) {
            this.yearSubscription.unsubscribe();
        }
    }

    private handleSpacePress = ((event: KeyboardEvent) => {
        if (event.key === ' ') {
            if (!this.state.paused) {
                this.pause();
            } else {
                this.unPause();
            }
        }
    }).bind(this)

    private pause() {
        this.setState({
            paused: true
        });
        this.setVideoAt(this.state.currentYear);
        this.yearSubscription.unsubscribe();
    }

    private unPause() {
        this.setState({
            paused: false
        });
        this.resumeVideo();
    }

    private setVideoAt(year: number) {
        const end = this.state.scenery[this.state.scenery.length - 1].endYear;
        this.yearEmitter$ = zip(
            range(year, end - year),
            timer(0, 100),
            (val, _) => val
        );
        this.setState({ currentYear: year });
    }

    private resumeVideo() {
        if (this.yearSubscription && !this.yearSubscription.closed) {
            this.yearSubscription.unsubscribe();

        }
        this.yearSubscription = this.yearEmitter$.subscribe(y => this.setState({ currentYear: y }));
    }

    private getCurrentScene() {
        return this.state.scenery.find(s => !s.isOutdated(this.state.currentYear));
    }
}