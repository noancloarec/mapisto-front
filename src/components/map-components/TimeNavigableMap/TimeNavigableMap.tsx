import React, { KeyboardEvent } from 'react';
import { TimeSelector } from './TimeSelector';
import { NavigableMap } from '../NavigableMap/NavigableMap';
import './TimeNavigableMap.css';
import { LoadingIcon } from '../../loading-icon/LoadingIcon';
import { Subject } from 'rxjs';
import { throttleTime } from 'rxjs/operators';
import { MapistoPoint } from 'src/entities/MapistoPoint';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';

interface State {
    yearOnSelector: number;
    yearDisplayed: number;
    loading: boolean;
}
interface Props {
    initialYear: number;
    initialCenter: MapistoPoint;
    initialWidth: number;
    onYearChange: (newYear: number) => void;
    onTerritoryClicked: (territory: MapistoTerritory) => void;
}
export class TimeNavigableMap extends React.Component<Props, State>{
    private timeChangeSubject$: Subject<number>;
    public static defaultProps = {
        yearChange: () => { return; },
        onTerritoryClicked: () => { return; }
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
                throttleTime(600, undefined, { leading: false, trailing: true })
            )
            .subscribe((newYear) => {
                this.setState({
                    yearDisplayed: newYear
                }, () => this.props.onYearChange(newYear));
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

    private navigateThroughYears(event: KeyboardEvent<HTMLDivElement>) {
        if (event.key === "ArrowLeft") {
            this.changeYear(
                this.state.yearOnSelector - 1
            );
        } else if (event.key === "ArrowRight") {
            this.changeYear(
                this.state.yearOnSelector + 1
            );
        }
    }

    render() {
        return <div className="time-navigable-map">
            <NavigableMap
                year={this.state.yearDisplayed}
                onTerritoriesLoaded={() => this.setState({ loading: false })}
                onKeyDown={event => this.navigateThroughYears(event)}
                initialCenter={this.props.initialCenter}
                initialWidth={this.props.initialWidth}
                onTerritoryClicked={this.props.onTerritoryClicked}
            />
            <TimeSelector
                year={this.state.yearOnSelector}
                yearChange={newYear => this.changeYear(newYear)}
            />
            {(this.state.loading &&
                <div className="loading-box">
                    <LoadingIcon loading={true} />
                </div>
            )}
        </div>;
    }
}