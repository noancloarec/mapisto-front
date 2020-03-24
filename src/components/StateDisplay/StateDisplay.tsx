import { RootState } from "src/store/reducer";
import { connect } from "react-redux";
import React from "react";
import { MapistoState } from "src/interfaces/mapistoState";
import { WorldMap } from "src/components/OldWorldMap/OldWorldMap";
import { loadState } from "src/api/MapistoApi";
import { changeStatePeriod } from 'src/store/actions';
import './StateDisplay.css';
interface StateProps {
    selectedState: MapistoState;
    year: number;
}
interface DispatchProps {
    changeStatePeriod: () => void;
}
interface State {
    detailedState: MapistoState;
}
type Props = StateProps & DispatchProps;
class StateDisplay extends React.Component<Props, State>{
    constructor(props: Props) {
        super(props);
        this.state = {
            detailedState: undefined
        };
    }
    componentDidMount() {
        loadState(this.props.selectedState.state_id, this.props.year).subscribe(
            state => this.setState({
                detailedState: state
            })
        );
    }
    renderMap() {
        if (this.state.detailedState) {
            return <WorldMap
                year={this.props.year}
                focusedState={this.state.detailedState}>
            </WorldMap>;
        } else {
            return <p>Loading...</p>;
        }
    }

    render() {
        return (
            <section id="state-display">
                <h1>{this.props.selectedState.name}</h1>
                <div className="state-display-map-container">

                    {this.renderMap()}
                </div>
                <h3>Existed between&nbsp;
                    <button className="dotted-button" onClick={() => this.props.changeStatePeriod()}>
                        {this.props.selectedState.validity_start.getUTCFullYear()}
                    </button>
                    &nbsp;and&nbsp;
                    <button className="dotted-button" onClick={() => this.props.changeStatePeriod()}>
                        {this.props.selectedState.validity_end.getUTCFullYear()}
                    </button>
                </h3>
            </section >
        );
    }
}
const mapStateToProps = (state: RootState): StateProps => {
    // console.log(`Setting component state with ${state.current_date.getUTCFullYear()}, from`);
    // console.log(state.current_date);

    return {
        selectedState: state.selectedState,
        year: state.current_date.getUTCFullYear()
    };
};

export const StateDisplayConnected = connect(
    mapStateToProps,
    { changeStatePeriod }
)(StateDisplay);