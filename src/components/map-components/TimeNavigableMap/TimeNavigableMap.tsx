import React from 'react';
import { TimeSelector } from './TimeSelector';
import { NavigableMap } from '../NavigableMap/NavigableMap';
import './TimeNavigableMap.css';
import { TimeNavigableSVGManager } from './TimeNavigableSVGManager';
import { LoadingIcon } from './LoadingIcon';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { ViewBoxLike } from '@svgdotjs/svg.js';

interface State {
    yearOnSelector: number;
    yearDisplayed: number;
    loading: boolean;
}
interface Props {
    initialYear: number;
    svgManager: TimeNavigableSVGManager;
    yearChange?: (newYearDisplayed: number) => void;
    initialViewBox: ViewBoxLike;
}
export class TimeNavigableMap extends React.Component<Props, State>{
    private timeChangeSubject$: Subject<number>;
    public static defaultProps = {
        svgManager: new TimeNavigableSVGManager()
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            yearOnSelector: props.initialYear,
            yearDisplayed: props.initialYear,
            loading: false
        };
        this.timeChangeSubject$ = new Subject<number>();
        this.timeChangeSubject$
            .pipe(
                throttleTime(800, undefined, { leading: true, trailing: true })
            )
            .subscribe((newYear) => {
                this.setState({
                    yearDisplayed: newYear
                }, () => this.props.yearChange(newYear));
            });
    }

    componentDidMount() {
        this.props.svgManager.attachOnKeyDown((key: KeyboardEvent) => {
            if (key.key === "ArrowLeft") {
                this.changeYear(

                    this.state.yearOnSelector - 1
                );
            } else if (key.key === "ArrowRight") {
                this.changeYear(

                    this.state.yearOnSelector + 1
                );
            }
        });
    }

    private changeYear(newYear: number) {
        this.setState({
            yearOnSelector: newYear,
            loading: true
        });
        if (!isNaN(newYear)) {
            this.timeChangeSubject$.next(newYear);
        }
    }

    render() {
        return <div className="time-navigable-map">
            <NavigableMap
                svgManager={this.props.svgManager}
                year={this.state.yearDisplayed}
                onStatesLoaded={() => this.setState({ loading: false })}
                initialViewBox={this.props.initialViewBox}
            ></NavigableMap>
            <TimeSelector
                year={this.state.yearOnSelector}
                yearChange={newYear => this.changeYear(newYear)}
            ></TimeSelector>
            {(this.state.loading &&
                <div className="loading-box">
                    <LoadingIcon loading={true}></LoadingIcon>
                </div>
            )}
        </div>;
    }
}