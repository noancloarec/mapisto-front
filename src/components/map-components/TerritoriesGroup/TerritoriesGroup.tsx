import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { dateFromYear } from 'src/utils/date_utils';
import './TerritoriesGroup.css';
interface Props {
    territories: MapistoTerritory[];
    year: number;
    strokeWidth: number;
    onTerritoryPressed?: (territory: MapistoTerritory) => void;
}
const TerritoriesGroupUnpure: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <g className="territories-group" strokeWidth={props.strokeWidth}>
            <p>{props.strokeWidth}</p>
            {renderTerritories(props.territories, props.year, props.onTerritoryPressed)}
        </g>
    );
};

const renderTerritories = (
    territories: MapistoTerritory[],
    year: number,
    onTerritoryPressed: (t: MapistoTerritory) => void
) => {
    const res = [];
    const date = dateFromYear(year);
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