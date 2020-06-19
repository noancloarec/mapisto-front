import React from 'react';
import { connect } from "react-redux";
import { RootState } from "src/store";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { MapistoState } from "src/entities/mapistoState";
import { changeEditionType } from 'src/store/edition/actions';
import { FocusedOnTerritoryMap } from 'src/components/map-components/FocusedOnTerritoryMap/FocusedOnTerritoryMap';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { EditionType } from 'src/store/edition/types';
import './RenameTerritoryOrState.css';
import { dateFromYear } from 'src/utils/date_utils';

interface StateProps {
    selectedTerritory: MapistoTerritory;
    selectedState: MapistoState;
    year: number;
}
interface DispatchProps {
    choseRenameTerritory: () => void;
    choseRenameState: () => void;
}

type Props = StateProps & DispatchProps;
class RenameTerritoryOrState extends React.Component<Props, {}>{
    render() {
        const name = this.props.selectedState.getName(dateFromYear(this.props.year));
        return (
            <div id="rename-territory-or-state">
                <h1 >
                    What do you mean?
                </h1>
                <div className="row">
                    <div className="col-6">
                        <div>
                            <FocusedOnTerritoryMap territory={this.props.selectedTerritory} />
                        </div>
                    </div>
                    <div className="col-6">
                        <div>
                            <FocusedOnStateMap mpState={this.props.selectedState} />
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-6">
                        <div className="d-flex flex-column justify-content-center">
                            <h4 className="text-center">The territory name is wrong</h4>
                            <small className="form-text text-muted text-center">
                                It was not part of {name} between &nbsp;
                            {this.props.selectedTerritory.startYear}
                                &nbsp;and&nbsp;
                            {this.props.selectedTerritory.endYear}
                            </small>

                        </div>
                    </div>
                    <div className="col-6">
                        <div className="d-flex flex-column justify-content-center">
                            <h4 className="text-center">The state is wrong</h4>
                            <small className="form-text text-muted text-center">
                                {name} is mispelled
                        </small>
                            <small className="form-text text-muted text-center">
                                Rename it for the period {this.props.selectedState.startYear}
                                &nbsp;-&nbsp;
                                {this.props.selectedState.endYear}
                            </small>
                        </div>
                    </div>
                </div>
                <div className="row mt-2">
                    <div className="col-6 d-flex justify-content-center">
                        <button
                            className="btn btn-primary m-auto"
                            onClick={() => this.props.choseRenameTerritory()}
                        >
                            Rename this territory
                        </button>

                    </div>
                    <div className="col-6 d-flex justify-content-center">
                        <button className="btn btn-primary m-auto" onClick={this.props.choseRenameState}>
                            Rename the state (all territories)
                        </button>
                    </div>
                </div>
            </div >
        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    selectedState: state.edition.selectedState,
    selectedTerritory: state.edition.selectedTerritory,
    year: state.mainMap.currentYear
});

const mapDispatchToProps: DispatchProps = {
    choseRenameState: () => changeEditionType(EditionType.RenameState),
    choseRenameTerritory: () => changeEditionType(EditionType.RenameTerritory)
};
export const RenameTerritoryOrStateConnected = connect(mapStateToProps, mapDispatchToProps)(RenameTerritoryOrState);