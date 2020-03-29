import React from 'react';
import { TimeSelector } from './TimeSelector';
import { NavigableMap } from '../NavigableMap/NavigableMap';
import './TimeNavigableMap.css';
import { TimeNavigableSVGManager } from './TimeNavigableSVGManager';

interface State {
    year: number;
}
interface Props {
    svgManager: TimeNavigableSVGManager;
}
export class TimeNavigableMap extends React.Component<Props, State>{
    public static defaultProps = {
        svgManager: new TimeNavigableSVGManager()
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            year: 1918
        };
    }

    componentDidMount() {
        this.props.svgManager.attachOnKeyDown((key: KeyboardEvent) => {
            if (key.key === "ArrowLeft") {
                this.setState({
                    year: this.state.year - 1
                });
            } else if (key.key === "ArrowRight") {
                this.setState({ year: this.state.year + 1 });
            }
        });
    }

    render() {
        return <div className="time-navigable-map">
            <TimeSelector
                year={this.state.year}
                yearChange={newYear => this.setState({ year: newYear })}
            ></TimeSelector>
            <NavigableMap svgManager={this.props.svgManager} year={this.state.year}></NavigableMap>
        </div>;
    }
}