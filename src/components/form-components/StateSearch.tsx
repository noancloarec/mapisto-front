import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { StateAutoComplete } from './StateAutoComplete';
import { dateFromYear } from 'src/utils/date_utils';
interface Props {
    onMPStateChange: (mpState: MapistoState) => void;
}
interface State {
    innerValue: MapistoState;
}
export class StateSearch extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            innerValue: new MapistoState(dateFromYear(12), dateFromYear(12), null, '', [], null, null)
        };
    }
    render() {
        return < StateAutoComplete
            onMpStateChange={st => {
                this.setState({
                    innerValue: st
                });
                if (st.stateId) {
                    this.props.onMPStateChange(st);
                }
            }}
            colorEnabled={false}
            onlySearch={true}
            mpState={this.state.innerValue}
            yearInputsEnabled={false}
        />;

    }
}