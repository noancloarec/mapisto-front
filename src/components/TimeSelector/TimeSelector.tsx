import { Component } from 'react';
import React from 'react';
import { updateTime } from '../../store/actions';

import './TimeSelector.css';
import { connect } from 'react-redux';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { dateFromYear } from 'src/utils/date_utils';


interface Props {
    updateTime: (newTime: Date) => void;
}
interface State {
    year: number;
}
class TimeSelector extends Component<Props, State>{

    targetForArrowNavigation: HTMLElement;
    change$: Subject<void>;

    constructor(props: Props) {
        super(props);
        this.state = {
            year: 1918
        };
        this.change$ = new Subject<void>();
        this.change$.pipe(
            debounceTime(100)
        ).subscribe(
            () => this.props.updateTime(dateFromYear(this.state.year))
        );
    }

    changeYear(year: number) {
        this.setState({
            year
        }, () => {
            this.change$.next();
        });
    }

    render() {
        return (
            <div className="time-select">
                <span onClick={e => this.changeYear(this.state.year - 1)}>&#9664;</span>
                <input type="number" value={this.state.year} onChange={
                    e => this.changeYear(parseInt(e.target.value, 10))
                } />
                <span onClick={e => this.changeYear(this.state.year + 1)}>&#9654;</span>
            </div>
        );
    }
}


export const TimeSelectorConnected = connect(null, { updateTime })(TimeSelector);