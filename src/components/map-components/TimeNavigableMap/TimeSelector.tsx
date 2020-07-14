import { Component } from 'react';
import React from 'react';

import './TimeSelector.css';
import { Slider, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

interface Props {
    yearChange: (newYear: number) => void;
    year: number;
}

interface State {
    showSlider: boolean;
}
export class TimeSelector extends Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            showSlider: false
        };
    }
    render() {
        return (
            <div className="time-selector">
                <div className="time-slider" style={{ marginTop: this.state.showSlider ? '0px' : '-90px' }}>
                    <Slider value={this.props.year} min={1000} max={2020} marks={{ 1000: '1000', 1500: '1500', 2000: '2000' }}
                        onChange={(e: any) => this.props.yearChange(e as unknown as number)}
                    />
                </div>
                <div className="time-select d-flex justify-content-center">
                    <svg viewBox="-1 -1 2 2" onClick={() => this.props.yearChange(this.props.year - 1)}>
                        <path d="M -1 0 L 1 1 L 1 -1 Z" />
                    </svg>
                    <input type="number" value={this.props.year + ""} onChange={
                        e => this.props.yearChange(parseInt(e.target.value, 10))
                    } />
                    <svg viewBox="-1 -1 2 2" onClick={() => this.props.yearChange(this.props.year + 1)}>
                        <path d="M -1 1 L 1 0 L -1 -1 Z" />
                    </svg>
                    <div className='show-time-slider d-flex flex-column justify-content-center'>
                        <Button size='large'
                            icon={this.state.showSlider ? <UpOutlined /> : <DownOutlined />}
                            onClick={this.toggleSlider} />
                    </div>
                </div>
            </div>
        );
    }

    toggleSlider = () => {
        this.setState({
            showSlider: !this.state.showSlider
        })
    }
}
