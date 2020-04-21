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
            <div className="time-select d-flex justify-content-center">
                {
                    this.props.yearChange &&
                    (
                        <svg viewBox="-1 -1 2 2" onClick={e => this.props.yearChange(this.props.year - 1)}>
                            <path d="M -1 0 L 1 1 L 1 -1 Z" />
                        </svg>
                    )
                }
                <input type="number" value={this.props.year + ""} onChange={
                    e => this.props.yearChange(parseInt(e.target.value, 10))
                } disabled={!this.props.yearChange} />
                {
                    this.props.yearChange &&
                    <svg viewBox="-1 -1 2 2" onClick={e => this.props.yearChange(this.props.year + 1)}>
                        <path d="M -1 1 L 1 0 L -1 -1 Z" />
                    </svg>
                }
            </div>
        );
    }
}
