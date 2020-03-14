import React from 'react';
import './TerritoryPanel.css';
import { RootState } from '../../store/reducer';
import { connect } from 'react-redux';
import { MapistoTerritory } from '../../interfaces/mapistoTerritory';
import { MapistoState } from '../../interfaces/mapistoState';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import Axios from 'axios';
import { config } from '../../config';
import Moment from 'react-moment';
import { map } from 'rxjs/operators';
import {startRenaming, askForEditingType} from '../../store/actions';
interface StateProps {
    selectedTerritory: MapistoTerritory;
    currentDate: Date;
    selectedState : MapistoState;
}
interface DispatchProps {
    startRenaming: (state: MapistoState) => void;
    askForEditingType: (state: MapistoState) => void;
}
type Props = StateProps & DispatchProps;

class TerritoryPanel extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedState: undefined
        };
    }

    private getState(): Observable<MapistoState> {
        return from(Axios.get<MapistoState>(
            `${config.api_path}/state_from_territory/${this.props.selectedTerritory.territory_id}`, {
            params: {
                date: this.props.currentDate
            }
        }
        )).pipe(
            map(response => response.data)
        );
    }

    renderActionButtons() {
        const stateDetails = this.props.selectedState;
        return (
            <div className="action-buttons d-flex justify-content-center">
                <button className="btn btn-outline-danger"
                onClick={
                    () =>
                    stateDetails.name?
                    this.props.askForEditingType(stateDetails) : this.props.startRenaming(stateDetails)
                }
                >{stateDetails.name ? "This is not " + stateDetails.name : "I know the name"}</button>
            </div>
        );
    }

    renderStateDetails() {
        const stateDetails = this.props.selectedState;
        return (
            <div className="d-flex flex-column justify-content-between">
                <div>
                    <h1>A part of {stateDetails.name ? stateDetails.name : "Unknown state"}</h1>
                    <p>Le dessin ici</p>
                    {stateDetails.name &&
                    <h3>Remained in {stateDetails.name} and had these borders from&nbsp;
                    <Moment format="YYYY">{this.props.selectedTerritory.validity_start}</Moment>&nbsp;to&nbsp;
                    <Moment format="YYYY">{this.props.selectedTerritory.validity_end}</Moment>
                     </h3>
                    }
                </div>
                {this.renderActionButtons()}
            </div>
        );
    }

    renderLoading() {
        return (
            <p>Loading</p>
        );
    }

    render() {
        return (
            <div className={"territory-panel " + (this.props.selectedTerritory ? "opened" : "")}>
                {this.props.selectedState ? this.renderStateDetails() : this.renderLoading()}
            </div>
        );
    }
}

/**
 * Maps the redux state to the props of the loading Icon
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): StateProps => ({
    selectedTerritory: state.selectedTerritory,
    currentDate: state.current_date,
    selectedState : state.selectedState
});

export const TerritoryPanelConnected = connect(mapStateToProps, { startRenaming, askForEditingType })(TerritoryPanel);