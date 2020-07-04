import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import './TerritoriesGroup.css';
interface Props {
    territories: MapistoTerritory[];
    date: Date;
    strokeWidth: number;
    onTerritoryPressed?: (territory: MapistoTerritory) => void;
}
const TerritoriesGroupUnpure: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <g className="territories-group" strokeWidth={props.strokeWidth}>
            <p>{props.strokeWidth}</p>
            {renderTerritories(props.territories, props.date, props.onTerritoryPressed)}
        </g>
    );
};

const renderTerritories = (
    territories: MapistoTerritory[],
    date: Date,
    onTerritoryPressed: (t: MapistoTerritory) => void
) => {
    const res = [];
    for (const territory of territories) {
        res.push(
            <path
                key={territory.territoryId + '_' + territory.precisionLevel}
                onMouseDown={onTerritoryPressed ? () => onTerritoryPressed(territory) : undefined}
                fill={territory.color ? territory.color : territory.mpState.getColor(date)}
                d={territory.dPath}
            />
        );
    }
    return res;
};

export const TerritoriesGroup = React.memo(TerritoriesGroupUnpure);