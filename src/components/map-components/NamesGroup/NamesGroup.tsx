import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { intersect } from 'src/utils/svg_geometry';
import './NamesGroup.css';
import { getLabelColor } from 'src/utils/color_harmony';
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
        const name = t.name ? t.name : t.mpState.getName(this.props.date);
        const fillColor = getLabelColor(t.color ? t.color : t.mpState.getColor(this.props.date));

        const mainName = this.wrap(name, 10);
        const mainNameRes = mainName.split('\n').map((s: string, i: number) => (
            <text key={i}
                x={t.boundingBox.x + t.boundingBox.width / 2}
                y={t.boundingBox.y + t.boundingBox.height / 2 + i * this.props.viewbox.width / 80}
                textAnchor="middle"
                fontSize={this.props.viewbox.width / 80}
                fill={fillColor}
            >
                {s}
            </text>
        ));
        if (t.name) {
            const subName = `(${this.wrap(t.mpState.getName(this.props.date), 15)})`;
            return mainNameRes.concat(subName.split('\n').map((s: string, i: number) => (
                <text key={i + mainNameRes.length}
                    x={t.boundingBox.x + t.boundingBox.width / 2}
                    y={t.boundingBox.y + t.boundingBox.height / 2 +
                        (i + mainNameRes.length + 1) * this.props.viewbox.width / 130}
                    textAnchor="middle"
                    fontSize={this.props.viewbox.width / 130}
                    fill={fillColor}
                >
                    {s}
                </text>

            )));
        } else {
            return mainNameRes;
        }
    }



    private shouldDisplayName = (territory: MapistoTerritory): boolean => {
        return (territory.name || territory.mpState.getName(this.props.date))
            && this.isVisible(territory) &&
            territory.boundingBox.width > this.getMinimumWidthForNameDisplay();
    }
    private getMinimumWidthForNameDisplay() {
        return this.props.viewbox.width / 8;
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