import React from 'react';
import { MapistoState } from "src/entities/mapistoState";
import { Form, DatePicker, Input, Checkbox, Dropdown, Menu } from 'antd';
import moment from 'moment';
import { ArrowUpOutlined, ArrowDownOutlined, DeleteOutlined } from '@ant-design/icons';
import { StateRepresentation } from 'src/entities/StateRepresentation';
interface Props {
    value: MapistoState;
    onChange: (st: MapistoState) => void;
}

interface State {
    innerValue: MapistoState;
    stateStillAlive: boolean;
}
/**
 * Outputs only if state is valid
 */
export class StateInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            innerValue: props.value,
            stateStillAlive: props.value.validityEnd > new Date()
        };
    }

    render() {
        const innerValue = this.state.innerValue;
        return (
            <div>
                <Form.Item label="Start" >
                    <DatePicker value={moment(innerValue.validityStart.toISOString())} className="col-12"
                        onChange={(_, dateString) => this.handleStartChange(dateString)} />
                </Form.Item>
                <div>
                    {this.renderRepresentations()}
                </div>
                <Form.Item label="End" >
                    {
                        !this.state.stateStillAlive && (
                            <DatePicker value={moment(innerValue.validityEnd)} className="col-12"
                                onChange={(_, dateString) => this.handleEndChange(dateString)} />
                        )
                    }
                    <Checkbox onChange={this.toggleStateStillAlive} checked={this.state.stateStillAlive}>
                        The sovereign state still exists
                        </Checkbox>
                </Form.Item>
            </div>
        );
    }

    renderRepresentations() {
        return this.state.innerValue.representations.map((r, index) => (
            <div className="row" key={index}>
                <div className="col-10">
                    <div className="row">
                        <div className="col-11 offset-1">
                            <Form.Item label="Name">
                                <Input value={r.name}
                                    onChange={event => this.handleNameChange(event.target.value, index)} />
                            </Form.Item>
                            <Form.Item label="Color">
                                <input type="color" value={r.color} className="col-12"
                                    onChange={event => this.handleColorChange(event.target.value, index)} />
                            </Form.Item>
                        </div>
                    </div>
                    {
                        index < this.state.innerValue.representations.length - 1 && (
                            <Form.Item label="Name changed in">
                                <DatePicker value={moment(r.validityEnd)} className="col-12"
                                    onChange={
                                        (_, dateString) => this.handleRepresentationEndChange(dateString, index)
                                    } />
                            </Form.Item>
                        )
                    }
                </div>
                <div className="col-2">
                    {this.renderInsertRepresentationButton(index, this.state.innerValue.representations.length > 1)}

                </div>
            </div>

        ));
    }

    renderInsertRepresentationButton(index: number, canRemove: boolean) {
        const menu = (
            <Menu >
                <Menu.Item key="1" icon={<ArrowUpOutlined />}
                    onClick={() => this.createStateRepresentation(index, 'before')}>
                    Insert name before
                </Menu.Item>
                <Menu.Item key="2" icon={<DeleteOutlined />} disabled={!canRemove}
                    onClick={() => this.removeStateRepresentation(index)}>
                    Remove
                </Menu.Item>
                <Menu.Item key="3" icon={<ArrowDownOutlined />}
                    onClick={() => this.createStateRepresentation(index, 'after')}>
                    Insert name after
                </Menu.Item>
            </Menu>
        );

        return (
            <Dropdown.Button overlay={menu}>
            </Dropdown.Button>

        );
    }

    createStateRepresentation(fromIndex: number, position: 'before' | 'after') {
        const rep = this.state.innerValue.representations[fromIndex];
        const getMiddleDate = (start: Date, end: Date) => new Date((start.getTime() + end.getTime()) / 2);
        const middleDate = getMiddleDate(rep.validityStart, rep.validityEnd);
        const allReps = this.state.innerValue.representations;
        let newAllReps;
        if (position === 'before') {
            const newRep = new StateRepresentation(rep.validityStart, middleDate, '', rep.color);
            rep.validityStart = middleDate;
            newAllReps = [...allReps.slice(0, fromIndex), newRep, ...allReps.slice(fromIndex, allReps.length)];
        } else {
            const newRep = new StateRepresentation(middleDate, rep.validityEnd, '', rep.color);
            rep.validityEnd = middleDate;
            newAllReps = [...allReps.slice(0, fromIndex + 1), newRep, ...allReps.slice(fromIndex + 1, allReps.length)];
        }
        const s: MapistoState = Object.create(this.state.innerValue);
        s.representations = newAllReps;
        this.valueChanged(s);
    }

    removeStateRepresentation(indexToRemove: number) {
        const allReps = this.state.innerValue.representations;
        const repToRemove = this.state.innerValue.representations[indexToRemove];
        if (indexToRemove > 0) {
            allReps[indexToRemove - 1].validityEnd = repToRemove.validityEnd;
        }
        const s: MapistoState = Object.create(this.state.innerValue);
        s.representations = [...allReps.slice(0, indexToRemove), ...allReps.slice(indexToRemove + 1, allReps.length)];
        this.valueChanged(s);
    }

    toggleStateStillAlive = () => {
        const s: MapistoState = Object.create(this.state.innerValue);
        const newEnd = this.state.stateStillAlive ? new Date() : new Date('2030-01-01');
        s.validityEnd = newEnd;
        s.representations[s.representations.length - 1].validityEnd = newEnd;
        this.valueChanged(s);
        this.setState({
            stateStillAlive: !this.state.stateStillAlive
        });
    }

    handleRepresentationEndChange(dateString: string, index: number) {
        const d = this.dateStringToDate(dateString);
        const s: MapistoState = Object.create(this.state.innerValue);
        s.representations[index].validityEnd = d;
        s.representations[index + 1].validityStart = d;
        this.valueChanged(s);
    }

    private dateStringToDate(dString: string): Date {
        return new Date(dString + "T00:00:00.000Z");
    }

    handleStartChange = (dateString: string) => {
        /*
        Strange processing because ant design messes with timezones,
        see https://github.com/ant-design/ant-design/issues/17434
        */
        const d = this.dateStringToDate(dateString);
        const s = Object.create(this.state.innerValue);
        s.validityStart = d;
        s.representations[0].validityStart = d;
        this.valueChanged(s);
    }

    handleEndChange(dateString: string) {
        const s = Object.create(this.state.innerValue);
        const d = this.dateStringToDate(dateString);
        s.validityEnd = d;
        s.representations[s.representations.length - 1].validityEnd = d;
        this.valueChanged(s);
    }

    handleNameChange(name: string, index: number) {
        const s = Object.create(this.state.innerValue);
        s.representations[index].name = name;
        this.valueChanged(s);
    }

    handleColorChange(color: string, index: number) {
        const s = Object.create(this.state.innerValue);
        s.representations[index].color = color;
        this.valueChanged(s);
    }

    valueChanged(s: MapistoState) {
        this.setState({
            innerValue: s
        }, () => this.props.onChange(s));
    }

    shouldComponentUpdate(newProps: Props, newState: State) {
        return (newState !== this.state) || (newProps.value && newProps.value.stateId !== this.props.value.stateId);
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.value.stateId !== this.props.value.stateId) {
            this.setState({
                innerValue: this.props.value,
                stateStillAlive: this.props.value.validityEnd > new Date()
            });
        }
    }

}