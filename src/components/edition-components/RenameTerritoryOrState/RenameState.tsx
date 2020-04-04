import React, { FormEvent } from "react";
import { delay, tap } from "rxjs/operators";
import './RenameState.css';
import { MapistoState } from "src/entities/mapistoState";
import { MapistoAPI } from "src/api/MapistoApi";
import { connect } from "react-redux";
import { RootState } from "src/store";
import { finishSuccessfullEdition } from "src/store/edition/actions";
import { FocusedOnStateMap } from "src/components/map-components/FocusedOnStateMap/FocusedOnStateMap";
import { StateAutoCompleteWithEdition } from "src/components/form-components/StateAutoCompleteWithEdition";

/**
 * The current year is required to display the map thumbnail of the state.
 * Although date information is contained in the state itself
 */
interface StateProps {
    mpState: MapistoState;
    year: number;
}

interface DispatchProps {
    stateRenamed: (modifiedState: MapistoState) => void;
}
type Props = DispatchProps & StateProps;

interface State {
    loading: boolean;
    editSuccess: boolean;
    modifiedState: MapistoState;
}
/**
 * Rename, reassign or change the color of a mapisto state
 */
class RenameState extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
            editSuccess: false,
            modifiedState: undefined,
        };
    }
    render() {
        return (
            <div className="rename-state-container">
                <form action="" className="row mt-2" onSubmit={event => this.onSubmit(event)}>
                    <div className="form-group col-10 offset-1">
                        <StateAutoCompleteWithEdition
                            autoFocus
                            initialState={this.props.mpState}
                            onMpStateChange={st => this.setState({ modifiedState: st })}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary col-4 offset-4" disabled={
                        this.state.loading ||
                        !this.state.modifiedState

                    }>
                        {
                            this.state.loading &&
                            (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true">

                            </span>)
                        }
                        {this.state.editSuccess && (<i className="fas fa-check"></i>)}
                        Submit
                </button>
                </form>
                <div className="mt-2">

                    <FocusedOnStateMap
                        state_id={this.props.mpState.stateId}
                        year={this.props.year}
                    />
                </div>

            </div>

        );
    }

    /**
     * Reassign the state to another if a different state came from autocomplete
     * Rename the state/change color if the state remained the same
     */
    private onSubmit(event: FormEvent) {
        event.preventDefault();
        this.setState({
            loading: true
        });
        if (this.state.modifiedState.stateId === this.props.mpState.stateId) {
            this.doRename();
        } else {
            this.doReassign();
        }
    }

    /**
     * Renames the state or change the color in API
     */
    private doRename() {
        MapistoAPI.putState(this.state.modifiedState).pipe(
            tap(() => {
                this.setState({ loading: false, editSuccess: true });
            }),
            delay(1000),
            tap(() => {
                this.props.stateRenamed(this.state.modifiedState);
            })
        ).subscribe();
    }

    private doReassign() {
        MapistoAPI.mergeStates(this.props.mpState.stateId, this.state.modifiedState.stateId).pipe(
            tap(() => {
                this.setState({ loading: false, editSuccess: true });
            }),
            delay(1000),
            tap(() => {
                this.props.stateRenamed(this.state.modifiedState);
            })
        ).subscribe();
    }

}

const mapStateToProps = (state: RootState): StateProps => ({
    mpState: state.edition.selectedState,
    year: state.mainMap.currentYear
});

const mapDispatchToProps: DispatchProps = {
    stateRenamed: () => finishSuccessfullEdition()
};
export const RenameStateConnected = connect(mapStateToProps, mapDispatchToProps)(RenameState);