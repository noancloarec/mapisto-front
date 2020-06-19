import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { StateAutoComplete } from './StateAutoComplete';
import { dateFromYear } from 'src/utils/date_utils';
import { StateRepresentation } from 'src/entities/StateRepresentation';
interface Props {
    onMPStateChange: (mpState: MapistoState) => void;
    placeholder: string;
}
interface State {
    innerValue: MapistoState;
}
export class StateSearch extends React.Component<Props, State> {
    public static defaultProps = {
        placeholder: ''
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            innerValue: new MapistoState(
                dateFromYear(12),
                dateFromYear(12),
                null,
                [new StateRepresentation(dateFromYear(12), dateFromYear(12), '', '#000000')],
                null
            )
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
            placeholder={this.props.placeholder}
            colorEnabled={false}
            onlySearch={true}
            mpState={this.state.innerValue}
            yearInputsEnabled={false}
        />;

    }
}