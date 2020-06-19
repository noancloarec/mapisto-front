import React from 'react';
import { MapistoState } from "src/entities/mapistoState";
import { Form, DatePicker, Input } from 'antd';
import moment from 'moment';
interface Props {
    value: MapistoState;
    onChange: (st: MapistoState) => void;
}

interface State {
    innerValue: MapistoState;
}
/**
 * Outputs only if state is valid
 */
export class StateInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            innerValue: props.value
        };
    }

    render() {
        const innerValue = this.state.innerValue;
        return (
            <div>
                <Form.Item label="Start" >
                    <DatePicker value={moment(innerValue.validityStart)}
                        onChange={m => this.handleStartChange(m.toDate())} />
                </Form.Item>
                <Form.Item label="Name">
                    <Input value={innerValue.representations[0].name}
                        onChange={name => this.handleNameChange(name.target.value, 0)} />
                </Form.Item>
                <Form.Item label="Color">
                    <input type="color" value={this.state.innerValue.representations[0].color}
                        onChange={c => this.handleColorChange(c.target.value, 0)} />
                </Form.Item>
                <Form.Item label="End" >
                    <DatePicker value={moment(innerValue.validityEnd)}
                        onChange={m => this.handleEndChange(m.toDate())} />
                </Form.Item>
            </div>
        );
    }

    handleStartChange(d: Date) {
        const s = this.state.innerValue;
        s.validityStart = d;
        s.representations[0].validityStart = d;
        this.stateChanged(s);
    }

    handleEndChange(d: Date) {
        const s = this.state.innerValue;
        s.validityEnd = d;
        s.representations[s.representations.length - 1].validityEnd = d;
        this.stateChanged(s);
    }

    handleNameChange(name: string, index: number) {
        const s = this.state.innerValue;
        s.representations[index].name = name;
        this.stateChanged(s);
    }

    handleColorChange(color: string, index: number) {
        const s = this.state.innerValue;
        s.representations[index].color = color;
        this.stateChanged(s);
    }

    stateChanged(s: MapistoState) {
        this.setState({
            innerValue: s
        }, () => this.props.onChange(s));

    }
}