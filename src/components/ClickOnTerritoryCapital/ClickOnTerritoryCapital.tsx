import React from "react";
import { connect } from "react-redux";
import { RootState } from "src/store/reducer";
import { MapistoState } from "src/interfaces/mapistoState";
import { getConcurrentStates, extendState } from "src/api/MapistoApi";
import { finishEdition, startExtendTerritory } from 'src/store/actions';
import { dateFromYear } from "src/utils/date_utils";
import { MapistoTerritory } from "src/interfaces/mapistoTerritory";
interface StateProps {
    editedTerritory: MapistoTerritory;
}
interface DispatchProps {
    startExtendTerritory: (capitalCoordinates: DOMPoint) => void;
}

interface State {
}
class ClickOnTerritoryCapital extends React.Component<StateProps & DispatchProps, State> {

    constructor(props: StateProps & DispatchProps) {
        super(props);
        this.state = {
        };
    }

    render() {
        return (
            <div>
                click on capital of {this.props.editedTerritory.territory_id}

            </div >
        );
    }
}
const mapStateToProps = (state: RootState): StateProps => ({
    editedTerritory: state.selectedTerritory
});

export const ClickOnTerritoryCapitalConnected = connect(
    mapStateToProps,
    { startExtendTerritory })
    (ClickOnTerritoryCapital);