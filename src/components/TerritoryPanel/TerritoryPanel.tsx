import React from 'react';
import './TerritoryPanel.css';
import { RootState } from '../../store/reducer';
import { connect } from 'react-redux';
import { MapistoTerritory } from '../../interfaces/mapistoTerritory';
import { MapistoState } from '../../interfaces/mapistoState';
import Moment from 'react-moment';
import { startRenaming, askForEditingType, showSelectedState } from '../../store/actions';
import { TerritoryThumbnail } from '../TerritoryThumbnail/TerritoryThumbnail';
interface StateProps {
    selectedTerritory: MapistoTerritory;
    currentDate: Date;
    selectedState: MapistoState;
}
interface DispatchProps {
    startRenaming: (state: MapistoState) => void;
    askForEditingType: (state: MapistoState) => void;
    showSelectedState: () => void;
}
type Props = StateProps & DispatchProps;

class TerritoryPanel extends React.Component<Props, {}> {

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedState: undefined
        };
    }

    renderActionButtons() {
        const stateDetails = this.props.selectedState;
        return (
            <div className="action-buttons d-flex justify-content-center">
                <button className="btn btn-outline-danger"
                    onClick={
                        () =>
                            stateDetails.name ?
                                this.props.askForEditingType(stateDetails) : this.props.startRenaming(stateDetails)
                    }
                >{stateDetails.name ? "This is not " + stateDetails.name : "I know the name"}</button>
            </div>
        );
    }

    showState(event: React.MouseEvent) {
        event.preventDefault();
        this.props.showSelectedState();
    }

    renderStateDetails() {
        const stateDetails = this.props.selectedState;
        return (
            <div className="d-flex flex-column justify-content-between">
                <div>
                    <h1>A part of&nbsp;
                        <button className="dotted-button" onClick={e => this.showState(e)}>
                            {stateDetails.name ? stateDetails.name : "Unknown state"}
                        </button>
                    </h1>
                    <div className="thumbnail-in-panel">
                        <TerritoryThumbnail
                            territory={this.props.selectedTerritory} color={this.props.selectedState.color}
                        >
                        </TerritoryThumbnail>
                    </div>
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
    selectedState: state.selectedState
});

export const TerritoryPanelConnected = connect(
    mapStateToProps,
    { startRenaming, askForEditingType, showSelectedState }
)(TerritoryPanel);