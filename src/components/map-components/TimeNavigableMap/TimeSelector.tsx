import { Component } from 'react';
import React from 'react';

import './TimeSelector.css';

interface Props {
    yearChange?: (newYear: number) => void;
    year: number;
}
export class TimeSelector extends Component<Props, {}>{
    render() {
        return (
            <div className="time-select">
                {
                    this.props.yearChange &&
                    <span onClick={e => this.props.yearChange(this.props.year - 1)}>&#9664;</span>
                }
                <input type="number" value={this.props.year + ""} onChange={
                    e => this.props.yearChange(parseInt(e.target.value, 10))
                } disabled={!this.props.yearChange} />
                {
                    this.props.yearChange &&
                    <span onClick={e => this.props.yearChange(this.props.year + 1)}>&#9654;</span>
                }
            </div>
        );
    }
}
