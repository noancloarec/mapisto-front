import { Component } from 'react';
import React from 'react';

import './TimeSelector.css';
import { Slider, Button } from 'antd';
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const sliderMin = 1000;
const sliderMax = 2020;
interface Props {
    yearChange: (newYear: number) => void;
    year: number;
}

interface State {
    showSlider: boolean;
    sliderValue: number;
}
export class TimeSelector extends Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            showSlider: false,
            sliderValue: props.year
        };
    }

    render() {
        return (
            <div className="time-selector">
                <div className="time-slider" style={{ marginTop: this.state.showSlider ? '0px' : '-90px' }}>
                    <Slider value={this.state.sliderValue} min={sliderMin}
                        max={sliderMax} marks={{ 1000: '1000', 1500: '1500', 2000: '2000' }}
                        onChange={this.handleSliderChange}
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

    componentDidUpdate(prevProps: Props) {
        if (this.props.year && prevProps.year !== this.props.year) {
            this.updateSlider();
        }
    }

    handleSliderChange = (value: any) => {
        const nbValue = value as unknown as number;
        if ((nbValue >= sliderMin && this.props.year > sliderMin)
            || (nbValue <= sliderMax && this.props.year < sliderMax)) {
            this.props.yearChange(nbValue);
        }
    }

    updateSlider() {
        console.log('update slider');
        if (this.props.year >= sliderMin && this.props.year <= sliderMax) {
            this.setState({
                sliderValue: this.props.year
            });
        } else if (this.props.year < sliderMin) {
            this.setState({
                sliderValue: sliderMin
            });
        } else {
            this.setState({
                sliderValue: sliderMax
            });
        }
    }

    toggleSlider = () => {
        this.setState({
            showSlider: !this.state.showSlider
        });
    }
}
