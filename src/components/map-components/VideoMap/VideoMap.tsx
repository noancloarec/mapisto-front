import React from 'react';
import { Scene } from 'src/entities/Scene';
import { MapistoState } from 'src/entities/mapistoState';
import { MapistoMap } from '../MapistoMap/MapistoMap';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { Land } from 'src/entities/Land';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { viewboxAsString } from '../MapistoMap/display-utilities';
import { LandsGroup } from '../LandsGroup/LandsGroup';
import { TerritoriesGroup } from '../TerritoriesGroup/TerritoriesGroup';
import { dateFromYear } from 'src/utils/date_utils';
import { NamesGroup } from '../NamesGroup/NamesGroup';
interface Props {
    year: number;
    scenery: Scene[];
}
interface State {
    territoriesToDisplay: MapistoTerritory[];
    currentBbox: ViewBoxLike;
    currentLands: Land[];
}
export class VideoMap extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            currentBbox: this.getCurrentScene().bbox,
            currentLands: this.getCurrentScene().lands,
            territoriesToDisplay: this.getCurrentScene().getYear(this.props.year)
        };
    }
    componentDidUpdate(prevProps: Props) {
        if (this.props.year !== prevProps.year) {
            const scene = this.getCurrentScene();
            this.setState({
                territoriesToDisplay: scene.getYear(this.props.year),
                currentBbox: scene.bbox,
                currentLands: scene.lands
            });

        }
    }
    render = () => {
        const scene = this.getCurrentScene();
        const territories = scene.getYear(this.props.year);
        console.log(this.props.year)
        return (

            <div className="map">
                <svg viewBox={viewboxAsString(scene.bbox)}>
                    <LandsGroup lands={scene.lands} />
                    <TerritoriesGroup
                        territories={territories}
                        date={dateFromYear(this.props.year)}
                        strokeWidth={scene.bbox.width ** .5 / 30} />
                    <NamesGroup
                        territories={territories}
                        date={dateFromYear(this.props.year)}
                        viewbox={scene.bbox}
                    />
                </svg>
            </div>
        );
    }


    /**
     * Selects in the scenery, the scene that happens in this year
     * @param props
     */
    private getCurrentScene(props = this.props): Scene {
        return props.scenery.find(s => !s.isOutdated(props.year));
    }
}