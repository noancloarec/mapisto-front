import React from 'react';
import { TimeNavigableMap } from '../TimeNavigableMap/TimeNavigableMap';
import { InteractiveSVGManager } from './InteractiveSVGManager';
import './InteractiveMap.css';
import { connect } from 'react-redux';
import { changeYear } from 'src/store/main-map/actions';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { selectTerritory } from 'src/store/edition/actions';
import { RootState } from 'src/store';

interface StateProps {
    initialYear: number;
}
interface DispatchProps {
    yearChange: (newYear: number) => void;
    onSelectTerritory: (t: MapistoTerritory) => void;
}
type Props = DispatchProps & StateProps;
export class InteractiveMap extends React.Component<Props, {}>{
    private svgManager: InteractiveSVGManager;
    constructor(props: Props) {
        super(props);
        this.svgManager = new InteractiveSVGManager();
        this.svgManager.territorySelection$.subscribe(t => this.props.onSelectTerritory(t));
    }
    render() {
        return (
            <div className="interactive-map">
                <TimeNavigableMap
                    svgManager={this.svgManager}
                    yearChange={y => {
                        console.log('calling for yearchange');
                        this.props.yearChange(y);
                    }
                    }
                    initialYear={this.props.initialYear}

                ></TimeNavigableMap>
            </div>
        );
    }
}

const mapDispatchToProps = {
    yearChange: (newYear: number) => changeYear(newYear),
    onSelectTerritory: (terr: MapistoTerritory) => selectTerritory(terr)
};

const mapStateToProps = (state: RootState): StateProps => ({
    initialYear: state.mainMap.currentYear
})

export const InteractiveMapConnected = connect(mapStateToProps, mapDispatchToProps)(InteractiveMap);