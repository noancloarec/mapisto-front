import React from 'react';
import { TimeNavigableMap } from '../TimeNavigableMap/TimeNavigableMap';
import { InteractiveSVGManager } from './InteractiveSVGManager';
import './InteractiveMap.css';


export class InteractiveMap extends React.Component<{}, {}>{
    private svgManager: InteractiveSVGManager;
    constructor(props: {}) {
        super(props);
        this.svgManager = new InteractiveSVGManager();
    }
    render() {
        return (
            <div className="interactive-map">
                <TimeNavigableMap svgManager={this.svgManager}></TimeNavigableMap>
            </div>
        );
    }
}