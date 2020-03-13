import React from "react";
import { RootState } from "store/reducer";
import { startRenaming } from "store/actions";
import { connect } from "react-redux";
import { MapistoState } from "@interfaces/mapistoState";
import './CorrectionChoice.css'

interface StateProps {
    mpState: MapistoState
}

interface DispatchProps {
    startRenaming: (toRename: MapistoState) => void
}

interface State {
}
type Props = StateProps & DispatchProps
class CorrectionChoice extends React.Component<Props, State>{


    render() {
        return (
            <div className="correction-choice">
                <h1>What is wrong?</h1>
                <button className="btn btn-outline-primary" onClick={() => this.props.startRenaming(this.props.mpState)}>
                    There is no state such as {this.props.mpState.name}, it's mispelled
                    </button>
            </div>

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

export const CorrectionChoiceConnected = connect(mapStateToProps, { startRenaming })(CorrectionChoice)