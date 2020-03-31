import React from "react";
import { connect } from "react-redux";
import './EditionPopup.css';
import { EditionType } from "src/store/edition/types";
import { changeEditionType } from "src/store/edition/actions";
import { RootState } from "src/store";
import { ChooseAction } from "../ChooseAction/ChooseAction";
import { StateDisplayConnected } from "../StateDisplay/StateDisplay";
import { RenameTerritoryOrStateConnected } from "../RenameTerritoryOrState/RenameTerritoryOrState";
import { RenameStateConnected } from "../RenameTerritoryOrState/RenameState";
import { MapistoState } from "src/entities/mapistoState";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { ExtendStatePeriodConnected } from "../ExtendStatePeriod/ExtendStatePeriod";
import { ExtendTerritoryPeriodConnected } from "../ExtendTerritoryPeriod/ExtendTerritory";

interface StateProps {
    editionType: EditionType;
    selectedState: MapistoState;
    selectedTerritory: MapistoTerritory;
}

interface DispatchProps {
    cancelEdition: () => void;
    choseRenameStateOrTerritory: () => void;
    choseExtendTerritory: () => void;
    choseRenameTerritory: () => void;
    choseRenameState: () => void;
    choseExtendState: () => void;
}
type Props = StateProps & DispatchProps;
class EditionPopup extends React.Component<Props, {}>{
    renderEditionComponent() {
        switch (this.props.editionType) {
            case EditionType.AskRenameOrExtendTerritory:
                return <ChooseAction
                    choices={[{
                        text: `This is not ${this.props.selectedState.name}`,
                        action: this.props.choseRenameStateOrTerritory
                    },
                    {
                        text: `The borders were stable for longer than ${this.props.selectedTerritory.validityStart.getUTCFullYear()} \
                        - ${this.props.selectedTerritory.validityEnd.getUTCFullYear()}`,
                        action: this.props.choseExtendTerritory
                    }
                    ]}
                />;
            case EditionType.AskRenameOrExtendState:
                return <ChooseAction
                    choices={[{
                        text: `The name ${this.props.selectedState.name} is wrong`,
                        action: this.props.choseRenameState
                    },
                    {
                        text: `${this.props.selectedState.name} existed for longer than ${this.props.selectedState.validityStart.getUTCFullYear()} \
                        - ${this.props.selectedState.validityEnd.getUTCFullYear()}`,
                        action: this.props.choseExtendState
                    }
                    ]}

                />;
            case EditionType.DisplayState:
                return <StateDisplayConnected />;
            case EditionType.RenameStateOrTerritory:
                return <RenameTerritoryOrStateConnected />;
            case EditionType.RenameState:
                return <RenameStateConnected />;
            case EditionType.ExtendStatePeriod:
                return <ExtendStatePeriodConnected />;
            case EditionType.ExtendTerritoryPeriod:
                return <ExtendTerritoryPeriodConnected />;
            default:
                return <p>Rien trouve</p>;
        }

    }
    render() {
        if (this.props.editionType) {
            return <div className="editing-panel">
                <div className="black-overlay" onClick={() => this.props.cancelEdition()}></div>
                <div className="popup-container">
                    {this.renderEditionComponent()}
                </div>
            </div>;
        } else {
            return null;
        }
    }
}

/**
 * Maps the redux state to the props of the loading Icon
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): StateProps => ({
    editionType: state.edition.editionType,
    selectedState: state.edition.selectedState,
    selectedTerritory: state.edition.selectedTerritory
});
const mapDispatchToProps: DispatchProps = {
    cancelEdition: () => changeEditionType(null),
    choseExtendState: () => changeEditionType(EditionType.ExtendStatePeriod),
    choseExtendTerritory: () => changeEditionType(EditionType.ExtendTerritoryPeriod),
    choseRenameStateOrTerritory: () => changeEditionType(EditionType.RenameStateOrTerritory),
    choseRenameTerritory: () => changeEditionType(EditionType.RenameTerritory),
    choseRenameState: () => changeEditionType(EditionType.RenameState)
};
export const EditionPopupConnected = connect(mapStateToProps, mapDispatchToProps)(EditionPopup);