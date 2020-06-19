import React, { FormEvent } from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { FocusedOnTerritoryMap } from 'src/components/map-components/FocusedOnTerritoryMap/FocusedOnTerritoryMap';
import { MapistoAPI } from 'src/api/MapistoApi';
import { RootState } from 'src/store';
import { finishSuccessfullEdition } from 'src/store/edition/actions';
import { connect } from 'react-redux';
import './ReassignTerritory.css';
import { StateAutoCompleteWithCreation } from 'src/components/form-components/StateAutoCompleteWithCreation';

interface StateProps {
    selectedState: MapistoState;
    selectedTerritory: MapistoTerritory;
    year: number;
}

interface DispatchProps {
    onTerritoryStateChanged: () => void;
}

interface State {
    stateToReassign: MapistoState;
}

type Props = StateProps & DispatchProps;

class ReassignTerritory extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            stateToReassign: undefined
        };
    }
    render() {
        return (
            <div className="reassign-territory">
                <h1>Parent state choice</h1>
                <div className="reassign-territory-thumbnail">
                    <FocusedOnTerritoryMap territory={this.props.selectedTerritory} />
                </div>
                <div className="d-flex mt-2 justify-content-center">
                    <div className="flex-column col-10">
                        <form action="" onSubmit={e => this.submitForm(e)}>
                            <div className="form-group">
                                <label >
                                    What state does it belong to?
                                </label>
                                <StateAutoCompleteWithCreation
                                    territoryToBeContained={this.props.selectedTerritory}
                                    initialState={this.props.selectedState}
                                    onMpStateChange={st => this.setState({ stateToReassign: st })}
                                />
                            </div>
                            <button type="submit" className="btn btn-primary mt-2">Submit</button>
                        </form>

                    </div>
                </div>

            </div>
        );
    }

    submitForm(event: FormEvent) {
        event.preventDefault();
        if (!this.state.stateToReassign.stateId) {
            MapistoAPI.createState(this.state.stateToReassign).subscribe(
                stateId => MapistoAPI.changeTerritoryBelonging(
                    this.props.selectedTerritory.territoryId, stateId
                ).subscribe(
                    res => this.props.onTerritoryStateChanged()
                )
            );
        } else {
            MapistoAPI.changeTerritoryBelonging(
                this.props.selectedTerritory.territoryId, this.state.stateToReassign.stateId)
                .subscribe(res => this.props.onTerritoryStateChanged());
        }
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    selectedState: state.edition.selectedState,
    year: state.mainMap.currentYear,
    selectedTerritory: state.edition.selectedTerritory
});

const mapDispatchToProps: DispatchProps = {
    onTerritoryStateChanged: () => finishSuccessfullEdition()
};

export const ReassignTerritoryConnected = connect(mapStateToProps, mapDispatchToProps)(ReassignTerritory);