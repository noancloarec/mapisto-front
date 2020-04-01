import React from 'react';
import { TimeNavigableMap } from '../TimeNavigableMap/TimeNavigableMap';
import { InteractiveSVGManager } from './InteractiveSVGManager';
import './InteractiveMap.css';
import { connect } from 'react-redux';
import { changeYear } from 'src/store/main-map/actions';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { selectTerritory, fitSelectedToYear } from 'src/store/edition/actions';
import { RootState } from 'src/store';
import { EditionActionTypes } from 'src/store/edition/types';
import { MainMapActionTypes } from 'src/store/main-map/types';

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
                        this.props.yearChange(y);
                    }
                    }
                    initialYear={this.props.initialYear}

                ></TimeNavigableMap>
            </div>
        );
    }
}


const mapDispatchToProps = (
    dispatch: (action: EditionActionTypes | MainMapActionTypes) => void
): DispatchProps => ({
    yearChange: year => {
        dispatch(changeYear(year));
        dispatch(fitSelectedToYear(year));
    },
    onSelectTerritory: territory => dispatch(selectTerritory(territory))
});

const mapStateToProps = (state: RootState): StateProps => ({
    initialYear: state.mainMap.currentYear,
});

export const InteractiveMapConnected = connect(mapStateToProps, mapDispatchToProps)(InteractiveMap);