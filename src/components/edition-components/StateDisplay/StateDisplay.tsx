import { connect } from "react-redux";
import React from "react";
import './StateDisplay.css';
import { changeEditionType } from "src/store/edition/actions";
import { EditionType } from "src/store/edition/types";
import { RootState } from "src/store";
import { MapistoState } from "src/entities/mapistoState";
import { FocusedOnStateMap } from "src/components/map-components/FocusedOnStateMap/FocusedOnStateMap";

interface StateProps {
    selectedState: MapistoState;
    year: number;
}
interface DispatchProps {
    reportError: () => void;
}
type Props = StateProps & DispatchProps;
class StateDisplay extends React.Component<Props, {}>{


    render() {
        return (
            <section id="state-display">
                <h1>{this.props.selectedState.name}</h1>
                <div className="state-display-map-container">

                    <FocusedOnStateMap year={this.props.year} state_id={this.props.selectedState.stateId} />
                </div>
                <h3>Existed between&nbsp;
                        {this.props.selectedState.validityStart.getUTCFullYear()}
                    &nbsp;and&nbsp;
                        {this.props.selectedState.validityEnd.getUTCFullYear()}
                </h3>
                <button className="btn btn-outline-danger"
                    onClick={this.props.reportError}>
                    Report an error
                    </button>
            </section >
        );
    }
}
const mapStateToProps = (state: RootState): StateProps => {
    // console.log(`Setting component state with ${state.current_date.getUTCFullYear()}, from`);
    // console.log(state.current_date);

    return {
        selectedState: state.edition.selectedState,
        year: state.mainMap.currentYear
    };
};

const mapDispatchToProps: DispatchProps = {
    reportError: () => changeEditionType(EditionType.AskRenameOrExtendState)
};
export const StateDisplayConnected = connect(
    mapStateToProps,
    mapDispatchToProps
)(StateDisplay);