import React, { FormEvent } from "react";
import { RootState } from "store/reducer";
import { finishEdition } from "store/actions";
import { connect } from "react-redux";
import { MapistoState } from "interfaces/mapistoState";
import Axios from "axios";
import { from, of } from "rxjs";
import { config } from "../../config";
import {  catchError, delay, tap } from "rxjs/operators";
import './RenamingStatePanel.css'

interface StateProps {
    mpState: MapistoState
}

interface DispatchProps {
    finishEdition: (modifiedState : MapistoState) => void
}

interface State {
    loading: boolean;
    newName: string;
    nameChanged: boolean
}
type Props = StateProps & DispatchProps
class RenamingPanel extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props)
        this.state = {
            loading: false,
            newName: props.mpState.name,
            nameChanged: false
        }
    }

    renameState(event : FormEvent) {
        event.preventDefault()
        this.setState({
            loading: true
        })
        const modifiedState: MapistoState = {
            ...this.props.mpState,
            name: this.state.newName
        }
        from(Axios.put<string>(`${config.api_path}/state`, {state_id: modifiedState.state_id, name:modifiedState.name}, {
            params : {
                validity_start : modifiedState.validity_start,
                validity_end : modifiedState.validity_end
            }
        })).pipe(
            tap(res => {
                this.setState({ loading: false, nameChanged: true })
            }),
            delay(1000),
            tap(() => {
                
                this.props.finishEdition(modifiedState)
            }),
            catchError((error) => {
                console.error("trouve lerreur");
                console.error(error)
                return of(undefined)
            })

        ).subscribe()
    }


    render() {
        return (
            <form action="" onSubmit={event => this.renameState(event)}>
                <div className="form-group">
                    <label htmlFor="state_name">Name of the state</label>
                    <input autoFocus type="text" className="form-control" id="state_name" value={this.state.newName}
                        onChange={event => this.setState({ newName: (event.target as HTMLInputElement).value })} placeholder="The state's name"></input>
                </div>
                <button type="submit" className="btn btn-primary" disabled={this.state.loading}>
                    {this.state.loading && (<span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>)}
                    {this.state.nameChanged && (<i className="fas fa-check"></i>)}
                    Submit
                </button>
            </form>

        )
    }
}

/**
 * Maps the redux state to the props of the loading Icon
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): StateProps => ({
    mpState: state.selectedState
});

export const RenamingPanelConnected = connect(mapStateToProps, { finishEdition })(RenamingPanel)