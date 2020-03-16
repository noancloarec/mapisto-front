import { RootState } from "src/store/reducer";
import { connect } from "react-redux";
import React, { Props } from "react";
import { MapistoState } from "src/interfaces/mapistoState";
import { WorldMap } from "src/components/WorldMap/WorldMap";
import { loadState } from "src/api/MapistoApi";
import './StateDisplay.css'
interface StateProps {
    selectedState: MapistoState;
    year: number;
}
interface State {
    detailedState: MapistoState;
}
class StateDisplay extends React.Component<StateProps, State>{
    constructor(props: StateProps) {
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

    changeStatePeriod() {
        alert("C partiii")
    }

    render() {
        return (
            <section id="state-display">
                <h1>{this.props.selectedState.name}</h1>
                <div className="state-display-map-container">

                    {this.renderMap()}
                </div>
                <h3>Existed between&nbsp;
                    <button className="dotted-button" onClick={() => this.changeStatePeriod()}>
                        {this.props.selectedState.validity_start.getFullYear()}
                    </button>
                    &nbsp;and&nbsp;
                    <button className="dotted-button" onClick={() => this.changeStatePeriod()}>
                        {this.props.selectedState.validity_end.getFullYear()}
                    </button>
                </h3>
            </section >
        );
    }
}
const mapStateToProps = (state: RootState): StateProps => ({
    selectedState: state.selectedState,
    year: state.current_date.getUTCFullYear()
});

export const StateDisplayConnected = connect(
    mapStateToProps
)(StateDisplay);