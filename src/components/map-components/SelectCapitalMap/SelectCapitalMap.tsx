import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { SelectCapitalSVGManager } from './SelectCapitalSVGManager';
import { MapistoPoint } from 'src/entities/MapistoPoint';
interface Props {
    territory: MapistoTerritory;
    onCapitalChange: (capital: MapistoPoint) => void;
    year: number;
}
export class SelectCapitalMap extends React.Component<Props, {}>{
    private svgManager: SelectCapitalSVGManager;
    constructor(props: Props) {
        super(props);
        this.svgManager = new SelectCapitalSVGManager();
        this.svgManager.setTargetedTerritory(this.props.territory);
        this.svgManager.onSelectCapital = this.props.onCapitalChange;
    }
    render() {
        return <p>SET capital</p>;
    }
}