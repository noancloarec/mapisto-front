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
export const NamesGroup: React.FC<Props> = (props: Props) => (
    <g className="names-layer">
        {props.territories.filter(t => shouldDisplayName(t, props.viewbox, props.date)).map(t => (
            <g
                key={t.territoryId}
            >
                {renderNameOfTerritory(t, props.viewbox, props.date)}
            </g>)
        )};
        </g>
);

function renderNameOfTerritory(t: MapistoTerritory, viewbox: ViewBoxLike, date: Date) {
    const name = t.name ? t.name : t.mpState.getName(date);
    const fillColor = getLabelColor(t.color ? t.color : t.mpState.getColor(date));
    const fontSize = Math.sqrt(viewbox.width * viewbox.height) / 60;

    const mainName = wrap(name, 10);
    const mainNameRes = mainName.split('\n').map((s: string, i: number) => (
        <text key={i}
            x={t.boundingBox.x + t.boundingBox.width / 2}
            y={t.boundingBox.y + t.boundingBox.height / 2 + i * fontSize}
            textAnchor="middle"
            fontSize={fontSize}
            fill={fillColor}
        >
            {s}
        </text>
    ));
    if (t.name) {
        const subName = `(${wrap(t.mpState.getName(date), 15)})`;
        return mainNameRes.concat(subName.split('\n').map((s: string, i: number) => (
            <text key={i + mainNameRes.length}
                x={t.boundingBox.x + t.boundingBox.width / 2}
                y={t.boundingBox.y + t.boundingBox.height / 2 +
                    (i + mainNameRes.length + 1) * viewbox.width / 130}
                textAnchor="middle"
                fontSize={viewbox.width / 130}
                fill={fillColor}
            >
                {s}
            </text>

        )));
    } else {
        return mainNameRes;
    }
}



function shouldDisplayName(territory: MapistoTerritory, viewbox: ViewBoxLike, date: Date): boolean {
    return (territory.name || territory.mpState.getName(date))
        && isVisible(territory, viewbox) &&
        territory.boundingBox.width > getMinimumWidthForNameDisplay(viewbox);
}
function getMinimumWidthForNameDisplay(viewbox: ViewBoxLike) {
    return viewbox.width / 8;
}

function isVisible(territory: MapistoTerritory, viewbox: ViewBoxLike): boolean {
    return intersect(viewbox, territory.boundingBox);
}

function wrap(s: string, width: number) {
    return s.replace(
        new RegExp(`(?![^\\n]{1,${width}}$)([^\\n]{1,${width}})\\s`, 'g'), '$1\n'
    );
}