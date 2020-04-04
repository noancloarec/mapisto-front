import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { StateAutoComplete } from './StateAutoComplete';

interface Props {
    territoryToBeContained: MapistoTerritory;
    initialState: MapistoState;
    onMpStateChange: (newState: MapistoState) => void;
    autoFocus: boolean;
}
interface State {
    innerValue: MapistoState;
    lastOutputedState: MapistoState;
}

export class StateAutoCompleteWithCreation extends React.Component<Props, State>{
    public static defaultProps = {
        autoFocus: false
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            innerValue: props.initialState,
            lastOutputedState: undefined
        };
    }

    render() {
        return (
            <StateAutoComplete
                autoFocus={this.props.autoFocus}
                mpState={this.state.innerValue}
                canShowStateCreation={!this.forbidStateCreation()}
                onMpStateChange={st => this.handleStateChange(st)}
                maxStartYear={this.props.territoryToBeContained.startYear}
                minEndYear={this.props.territoryToBeContained.endYear}
                colorEnabled={this.isColorAndDateEnabled()}
                yearInputsEnabled={this.isColorAndDateEnabled()}
            />
        );
    }

    /**
     * The user should be forbidden from creating a state under certain conditions
     * 1. The state in the input is already a new state
     * 2. The name in the input is the name as the initial state
     * 3. The name in the input is empty
     * 4. The last outputed state was a real state (i.e. not created yet) and the name input has the same name
     */
    forbidStateCreation(): boolean {
        return !this.state.innerValue.stateId ||
            this.state.innerValue.name === this.props.initialState.name ||
            !this.state.innerValue.name ||
            (this.state.lastOutputedState &&
                this.state.lastOutputedState.stateId &&
                this.state.lastOutputedState.name === this.state.innerValue.name
            )
            ;
    }

    /**
     * Decides wether to output the mpState or not, and changes the inner value
     * @param newState the state just outputted
     */
    handleStateChange(newState: MapistoState) {
        if (this.shouldOutput(newState)) {
            this.props.onMpStateChange(newState);
            this.setState({
                lastOutputedState: newState
            });
        }
        this.setState({ innerValue: newState });
    }

    /**
     * Determines if the new state just outputted by inner autocomplete is worth outputting
     * As a new state is emitted when a user searches through states (with the search as name), there
     * is a risk of outputting wrong states. Prevented here
     * @param newState the state just outputted
     */
    shouldOutput(newState: MapistoState) {
        const isACreatedState = !newState.stateId;
        const isJustSelected = this.state.innerValue.stateId !== newState.stateId;
        return isACreatedState || isJustSelected;
    }


    isColorAndDateEnabled() {
        return this.state.innerValue.stateId === undefined;
    }
}