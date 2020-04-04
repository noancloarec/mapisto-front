import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { StateAutoComplete } from './StateAutoComplete';

interface Props {
    initialState: MapistoState;
    onMpStateChange: (newState: MapistoState) => void;
    autoFocus: boolean;
}
interface State {
    innerValue: MapistoState;
}

export class StateAutoCompleteWithEdition extends React.Component<Props, State>{
    public static defaultProps = {
        autoFocus: false
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            innerValue: props.initialState
        };
    }

    render() {
        return (
            <StateAutoComplete
                autoFocus={this.props.autoFocus}
                mpState={this.state.innerValue}
                onMpStateChange={st => this.handleStateChange(st)}
                maxStartYear={this.props.initialState.startYear}
                minEndYear={this.props.initialState.endYear}
                colorEnabled={this.state.innerValue.stateId === this.props.initialState.stateId}
                yearInputsEnabled={false}
            />
        );
    }

    /**
     * Decides wether to output the mpState or not, and changes the inner value
     * @param newState the state just outputted
     */
    handleStateChange(newState: MapistoState) {
        if (this.shouldOutput(newState)) {
            this.props.onMpStateChange(newState);
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
        const isInitialState = newState.stateId === this.props.initialState.stateId;
        const isJustSelected = this.state.innerValue.stateId !== newState.stateId;
        return (isInitialState || isJustSelected) && newState.name;
    }
}