import { connect } from "react-redux";
import React from "react";
import './StateDisplay.css';
import { changeEditionType } from "src/store/edition/actions";
import { EditionType } from "src/store/edition/types";
import { RootState } from "src/store";
import { MapistoState } from "src/entities/mapistoState";
import { FocusedOnStateMap } from "src/components/map-components/FocusedOnStateMap/FocusedOnStateMap";
import { Link } from "react-router-dom";

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
                <h2 className="text-center">
                    <a className="dotted-button"
                        href={`/movie/${this.props.selectedState.stateId}`}>Play its evolution</a>
                </h2>
                <div className="state-display-map-container">

                    <FocusedOnStateMap year={this.props.year} state_id={this.props.selectedState.stateId} />
                </div>
                <div className="m-3 d-flex justify-content-around">
                    <h4>Creation : {this.props.selectedState.startYear}</h4>
                    <h4>
                        End : {this.props.selectedState.endYear}
                    </h4>
                </div>
                <div className="d-flex justify-content-center">
                    <button className="btn btn-outline-danger"
                        onClick={this.props.reportError}>
                        Report an error
                    </button>
                </div>
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