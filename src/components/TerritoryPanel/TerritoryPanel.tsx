import React from 'react'
import './TerritoryPanel.css'
import { RootState } from '../../store/reducer';
import { connect } from 'react-redux';
import { MapistoTerritory } from '../../models/mapistoTerritory';
import { MapistoState } from '../../models/mapistoState';
import { Observable } from 'rxjs';
import { from } from 'rxjs';
import Axios from 'axios';
import { config } from '../../config';
import Moment from 'react-moment'
import { map } from 'rxjs/operators';
interface Props {
    selectedTerritory: MapistoTerritory,
    currentDate: Date
}
interface State {
    selectedState: MapistoState
}
class TerritoryPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props)
        this.state = {
            selectedState: undefined
        }
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.selectedTerritory || this.props.selectedTerritory.territory_id !== prevProps.selectedTerritory.territory_id) {
            this.loadState();
        }
    }

    private loadState() {
        this.getState().subscribe(
            mapistoState => this.setState({
                selectedState: mapistoState
            })
        )
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
        )
    }

    renderActionButtons() {
        const stateDetails = this.state.selectedState
        return (
            <div className="action-buttons d-flex justify-content-center">
                <button className="btn btn-outline-danger">{stateDetails.name ? "This is not " + stateDetails.name : "I know the name"}</button>
            </div>
        )
    }

    renderStateDetails() {
        const stateDetails = this.state.selectedState
        return (
            <div className="d-flex flex-column justify-content-between">
                <div>

                    <h1>{stateDetails.name ? stateDetails.name : "Unknown state"}</h1>
                    <h2>From <Moment format="YYYY">{stateDetails.validity_start}</Moment> to <Moment format="YYYY">{stateDetails.validity_end}</Moment> </h2>
                </div>
                {this.renderActionButtons()}
            </div>
        )
    }

    renderLoading() {
        return (
            <p>Loading</p>
        )
    }

    render() {
        return (
            <div className={"territory-panel " + (this.props.selectedTerritory ? "opened" : "")}>
                {this.state.selectedState ? this.renderStateDetails() : this.renderLoading()}
            </div>
        )
    }
}

/**
 * Maps the redux state to the props of the loading Icon
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): Props => ({
    selectedTerritory: state.selectedTerritory,
    currentDate: state.current_date
});

export const TerritoryPanelConnected = connect(mapStateToProps)(TerritoryPanel)