import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoMap } from '../MapistoMap/MapistoMap';
import { FocusedSVGManager } from '../FocusedOnStateMap/FocusedSVGManager';
import { MapistoState } from 'src/entities/mapistoState';
import { Land } from 'src/entities/Land';
import { MapistoAPI } from 'src/api/MapistoApi';
import { getMapPrecision, enlargeViewBox, fitViewboxToAspectRatio } from '../MapistoMap/display-utilities';
import '../FocusedOnStateMap/FocusedMap.css';
import { RootState } from 'src/store';
import { connect } from 'react-redux';

interface OwnProps {
    territory: MapistoTerritory;
    year: number;
    svgManager?: FocusedSVGManager;
}
interface State {
    mpStates: MapistoState[];
    lands: Land[];
}

interface StateProps {
    mapVersion: string;
}

type Props = OwnProps & StateProps;
class FocusedOnTerritoryMapUnconnected extends React.Component<Props, State>{
    private svgManager: FocusedSVGManager;
    constructor(props: Props) {
        super(props);
        if (this.props.svgManager) {
            this.svgManager = this.props.svgManager;
        } else {
            this.svgManager = new FocusedSVGManager();
        }

        this.state = {
            mpStates: [],
            lands: []
        };
    }

    componentDidMount() {
        this.updateMap(this.props.territory, this.props.year);
    }
    shouldComponentUpdate(newProps: Props, nextState: State) {
        if (newProps.territory !== this.props.territory ||
            this.props.year !== newProps.year ||
            newProps.mapVersion !== this.props.mapVersion
        ) {
            this.updateMap(newProps.territory, newProps.year);
            return false;
        }
        return true;
    }

    render() {
        return <MapistoMap
            SVGManager={this.svgManager}
            viewbox={this.props.territory.boundingBox}
            mpStates={this.state.mpStates}
            lands={this.state.lands}
        >

        </MapistoMap>;
    }

    private updateMap(territory: MapistoTerritory, year: number) {
        const bbox = enlargeViewBox(fitViewboxToAspectRatio(territory.boundingBox, 16 / 9), 1.2);
        this.svgManager.setFocusedTerritories([territory]);
        this.svgManager.setViewbox(bbox);
        const precision = getMapPrecision(this.svgManager);

        MapistoAPI.loadStates(
            year, precision, bbox
        ).subscribe(
            states =>
                this.setState({
                    mpStates: states
                })
        );
        MapistoAPI.loadLands(precision, bbox).subscribe(
            res => this.setState({
                lands: res
            })
        );

    }
}
const mapStateToProps = (state: RootState): StateProps => ({
    mapVersion: state.edition.mapVersion
});
export const FocusedOnTerritoryMap = connect(mapStateToProps)(FocusedOnTerritoryMapUnconnected);