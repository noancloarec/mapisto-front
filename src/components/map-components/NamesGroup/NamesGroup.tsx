import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { intersect } from 'src/utils/svg_geometry';
import './NamesGroup.css';
interface Props {
    territories: MapistoTerritory[];
    viewbox: ViewBoxLike;
    date: Date;
}
interface State {

}
export class NamesGroup extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
    }

    render = () => (
        <g className="names-layer">
            {this.renderAllNames()}
        </g>
    )

    renderAllNames() {
        return this.props.territories.filter(this.shouldDisplayName).map(t => (
            <g
                key={t.territoryId}
            >
                {this.renderNameOfTerritory(t)}
            </g>
        ));
    }
    renderNameOfTerritory(t: MapistoTerritory) {
        let name = t.name ? t.name : t.mpState.getName(this.props.date);

        name = this.wrap(name, 10);
        if (t.name) {
            name = `${name}\n(${this.wrap(t.mpState.getName(this.props.date), 10)})`
        }

        return name.split('\n').map((s, i) => (
            <text key={i}
                x={t.boundingBox.x + t.boundingBox.width / 2}
                y={t.boundingBox.y + t.boundingBox.height / 2 + i * this.props.viewbox.width / 80}
                textAnchor="middle"
                fontSize={this.props.viewbox.width / 80}
            >
                {s}
            </text>
        )
        );
    }



    private shouldDisplayName = (territory: MapistoTerritory): boolean => {
        return (territory.name || territory.mpState.getName(this.props.date))
            && this.isVisible(territory) &&
            territory.boundingBox.width > this.getMinimumWidthForNameDisplay();
    }
    private getMinimumWidthForNameDisplay() {
        return this.props.viewbox.width / 20;
    }

    private isVisible(territory: MapistoTerritory): boolean {
        return intersect(this.props.viewbox, territory.boundingBox);
    }

    private wrap(s: string, width: number) {
        return s.replace(
            new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'), '$1\n'
        );
    }


}