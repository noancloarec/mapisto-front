import React from 'react';
import { Form, Input, Checkbox } from 'antd';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
interface Props {
    value: MapistoTerritory;
    onChange: (t: MapistoTerritory) => void;
}

interface State {
    innerValue: MapistoTerritory;
    nameDiffers: boolean;
    colorDiffers: boolean;
}
export class TerritoryInput extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            innerValue: props.value,
            nameDiffers: !!props.value.name,
            colorDiffers: !!props.value.color
        };
    }

    render() {
        const innerValue = this.state.innerValue;
        return (
            <div>
                <Checkbox onChange={this.toggleNameDiffers} checked={!this.state.nameDiffers}>
                    The name is the same as the sovereign state
                        </Checkbox>
                {
                    this.state.nameDiffers && (
                        <Form.Item label="Name" >
                            <Input type="text" value={innerValue.name}
                                onChange={e => this.handleNameChange(e.target.value)} />
                        </Form.Item>
                    )
                }
                <span></span>
                <Checkbox onChange={this.toggleColorDiffers} checked={!this.state.colorDiffers}>
                    The color is the same as the sovereign state
                        </Checkbox>
                {
                    this.state.colorDiffers && (
                        <Form.Item label="Color" >
                            <Input type="color" value={innerValue.color} />
                        </Form.Item>
                    )
                }
            </div>
        );
    }


    toggleColorDiffers = () => {
        const t: MapistoTerritory = Object.create(this.state.innerValue);
        if (this.state.colorDiffers) {
            t.color = undefined;
        } else {
            t.color = t.mpState.getColor(t.validityStart);
        }
        this.setState({
            colorDiffers: !this.state.colorDiffers
        });
        this.valueChanged(t);
    }
    toggleNameDiffers = () => {
        const t: MapistoTerritory = Object.create(this.state.innerValue);
        if (this.state.nameDiffers) {
            t.name = undefined;
        }
        this.setState({
            nameDiffers: !this.state.nameDiffers
        });
        this.valueChanged(t);
    }

    handleNameChange(name: string) {
        const t: MapistoTerritory = Object.create(this.state.innerValue);
        t.name = name;
        this.valueChanged(t);
    }

    handleColorChange(color: string) {
        const t: MapistoTerritory = Object.create(this.state.innerValue);
        t.color = color;
        this.valueChanged(t);
    }
    valueChanged(s: MapistoTerritory) {
        this.setState({
            innerValue: s
        }, () => this.props.onChange(s));
    }


    componentDidUpdate(prevProps: Props) {
        if (prevProps.value.territoryId !== this.props.value.territoryId) {
            this.setState({
                innerValue: this.props.value,
                colorDiffers: !!this.props.value.color,
                nameDiffers: !!this.props.value.name
            });
        }
    }

}