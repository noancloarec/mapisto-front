import React from 'react';
import './TerritoryPanel.css';
import { connect } from 'react-redux';
import Moment from 'react-moment';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoState } from 'src/entities/mapistoState';
import { selectState, changeEditionType } from 'src/store/edition/actions';
import { RootState } from 'src/store';
import { FocusedOnTerritoryMap } from 'src/components/map-components/FocusedOnTerritoryMap/FocusedOnTerritoryMap';
import { MapistoAPI } from 'src/api/MapistoApi';
import { EditionType } from 'src/store/edition/types';
interface StateProps {
    selectedTerritory: MapistoTerritory;
    year: number;
}
interface DispatchProps {
    onSelectedStateLoaded: (state: MapistoState) => void;
    // startRenaming: (state: MapistoState) => void;
    startTerritoryEdition: () => void;
    startStateNaming: () => void;
    showSelectedState: () => void;
    // askForCapital: () => void;
}
type Props = StateProps & DispatchProps;

interface State {
    selectedState: MapistoState;
}

class TerritoryPanel extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            selectedState: undefined
        };
    }

    shouldComponentUpdate(newProps: Props, newState: State) {
        if (newProps.selectedTerritory && newProps.selectedTerritory !== this.props.selectedTerritory) {
            this.loadState(newProps.selectedTerritory.territoryId);
        }
        return true;
    }


    render() {
        return (
            <div className={"territory-panel " + (this.props.selectedTerritory ? "opened" : "")}>
                {
                    this.props.selectedTerritory && this.state.selectedState ?
                        this.renderTerritoryDetails() : this.renderLoading()}
            </div>
        );
    }


    renderActionButtons() {
        const reportErrorButton = (
            <button className="btn btn-outline-danger"
                onClick={
                    () => this.props.startTerritoryEdition()
                }
            >Report an error</button>
        );
        const fillNameButton = (
            <button className="btn btn-success"
                onClick={
                    () => this.props.startStateNaming()
                }
            >
                Fill in the name
            </button>
        );
        return (
            <div className="action-buttons d-flex justify-content-center">
                {this.state.selectedState.name ? reportErrorButton : fillNameButton}
            </div>
        );
    }

    renderTerritoryDetails() {
        const stateDetails = this.state.selectedState;
        return (
            <div className="d-flex flex-column justify-content-between">
                <div>
                    {
                        stateDetails.name ? (

                            <h1>A part of&nbsp;
                        <button className="dotted-button" onClick={this.props.showSelectedState}>
                                    {stateDetails.name}
                                </button>
                            </h1>
                        ) :
                            (
                                <h1>
                                    We could not figure out what this is yet
                                </h1>
                            )
                    }
                    <div className="thumbnail-in-panel">
                        <FocusedOnTerritoryMap
                            year={this.props.year}
                            territory={this.props.selectedTerritory}
                        />
                    </div>
                    {stateDetails.name &&
                        <h3>Borders between&nbsp;
                                <Moment format="YYYY">{this.props.selectedTerritory.validityStart}</Moment>
                            &nbsp;and&nbsp;
                                <Moment format="YYYY">{this.props.selectedTerritory.validityEnd}</Moment>
                        </h3>
                    }
                </div>
                {this.renderActionButtons()}
            </div >
        );
    }

    renderLoading() {
        return (
            <p>Loading</p>
        );
    }

    private loadState(territoryId: number) {
        MapistoAPI.getStateFromTerritory(territoryId, this.props.year).subscribe(
            res => this.setState({ selectedState: res }, () => this.props.onSelectedStateLoaded(res))
        );
    }

    startTerritoryExtend() {
        // this.props.askForCapital();
    }


}

/**
 * Maps the redux state to the props of the loading Icon
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): StateProps => ({
    selectedTerritory: state.edition.selectedTerritory,
    year: state.mainMap.currentYear,
});

const mapDispatchToProps: DispatchProps = {
    onSelectedStateLoaded: (st: MapistoState) => selectState(st),
    startTerritoryEdition: () => changeEditionType(EditionType.AskRenameOrExtendTerritory),
    showSelectedState: () => changeEditionType(EditionType.DisplayState),
    startStateNaming: () => changeEditionType(EditionType.RenameState)

};
export const TerritoryPanelConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(TerritoryPanel);