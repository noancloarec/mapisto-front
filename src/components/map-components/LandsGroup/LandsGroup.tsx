import React from 'react';
import { Land } from 'src/entities/Land';
import './LandsGroup.css'
interface Props {
    lands: Land[];
}

const LandsGroupUnpure: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <g className="lands-group">
            {renderLands(props.lands)}
        </g>
    );
};

const renderLands = (lands: Land[]) => {
    return lands.map(land => (
        <path key={land.land_id + '_' + land.precision_level} d={land.d_path} />
    ));

};

export const LandsGroup = React.memo(LandsGroupUnpure);