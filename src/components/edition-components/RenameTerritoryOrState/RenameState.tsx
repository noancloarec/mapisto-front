import React, { FormEvent } from "react";
import { delay, tap } from "rxjs/operators";
import './RenameState.css';
import { MapistoState } from "src/entities/mapistoState";
import { MapistoAPI } from "src/api/MapistoApi";
import { connect } from "react-redux";
import { RootState } from "src/store";
import { changeEditionType } from "src/store/edition/actions";

interface StateProps {
    mpState: MapistoState;
}

interface DispatchProps {
    stateRenamed: (modifiedState: MapistoState) => void;
}
type Props = DispatchProps & StateProps;

interface State {
    loading: boolean;
    newName: string;
    nameChanged: boolean;
}
class RenameState extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.state = {
            loading: false,
            newName: props.mpState.name,
            nameChanged: false
        };
    }

    private renameState(event: FormEvent) {
        event.preventDefault();
        this.setState({
            loading: true
        });
        const modifiedState = new MapistoState(
            this.props.mpState.validityStart,
            this.props.mpState.validityEnd,
            this.props.mpState.stateId,
            this.state.newName,
            this.props.mpState.territories,
            this.props.mpState.color,
            this.props.mpState.boundingBox,
        );
        MapistoAPI.renameState(modifiedState).pipe(
            tap(() => {
                this.setState({ loading: false, nameChanged: true });
            }),
            delay(1000),
            tap(() => {
                this.props.stateRenamed(modifiedState);
            })
        ).subscribe();
    }


    render() {
        return (
            <form action="" onSubmit={event => this.renameState(event)}>
                <div className="form-group">
                    <label htmlFor="state_name">Name of the state</label>
                    <input autoFocus type="text" className="form-control" id="state_name" value={this.state.newName}
                        onChange={
                            event => this.setState({ newName: (event.target as HTMLInputElement).value })
                        } placeholder="The state's name"></input>
                </div>
                <button type="submit" className="btn btn-primary" disabled={this.state.loading}>
                    {
                        this.state.loading &&
                        (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>)
                    }
                    {this.state.nameChanged && (<i className="fas fa-check"></i>)}
                    Submit
                </button>
            </form>

        );
    }
}

const mapStateToProps = (state: RootState): StateProps => ({
    mpState: state.edition.selectedState
});

const mapDispatchToProps: DispatchProps = {
    stateRenamed: () => changeEditionType(null)
};
export const RenameStateConnected = connect(mapStateToProps, mapDispatchToProps)(RenameState);