import React from 'react';
import { Scene } from 'src/entities/Scene';
import { MapistoState } from 'src/entities/mapistoState';
import { MapistoMap } from '../MapistoMap/MapistoMap';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { Land } from 'src/entities/Land';
interface Props {
    year: number;
    scenery: Scene[];
}
interface State {
    statesToDisplay: MapistoState[];
    currentBbox: ViewBoxLike;
    currentLands: Land[];
}
export class VideoMap extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            currentBbox: this.getCurrentScene().bbox,
            currentLands: this.getCurrentScene().lands,
            statesToDisplay: this.getCurrentScene().getYear(this.props.year)
        };
    }
    shouldComponentUpdate(newProps: Props) {
        if (newProps.year !== this.props.year) {
            const scene = newProps.scenery.find(s => !s.isOutdated(newProps.year));
            this.setState({
                statesToDisplay: scene.getYear(newProps.year),
                currentBbox: scene.bbox,
                currentLands: scene.lands
            });
        }
        return true;
    }
    render() {
        return <MapistoMap
            mpStates={this.state.statesToDisplay}
            viewbox={this.state.currentBbox}
            lands={this.state.currentLands} />;
    }

    private getCurrentScene(props = this.props) {
        return props.scenery.find(s => !s.isOutdated(props.year));
    }
}