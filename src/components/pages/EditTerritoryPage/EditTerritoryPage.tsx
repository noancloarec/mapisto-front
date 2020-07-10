import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoAPI } from 'src/api/MapistoApi';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { Button, Dropdown, Menu } from 'antd';
import { EditOutlined, LeftOutlined, SaveOutlined } from '@ant-design/icons';
import './EditTerritoryPage.css';
import { FocusedOnTerritoryMap } from 'src/components/map-components/FocusedOnTerritoryMap/FocusedOnTerritoryMap';
import { StateSearch } from 'src/components/StateSearch/StateSearch';
import { Link } from 'react-router-dom';
import moment from 'moment';

import { Header } from 'src/components/Header/Header';
import Form from 'antd/lib/form/Form';
import { MapistoState } from 'src/entities/mapistoState';
import { TerritoryInput } from 'src/components/form-components/TerritoryInput';


type Props = RouteComponentProps<{ territory_id: string }>;
interface State {
    territory: MapistoTerritory;
    modifiedTerritory: MapistoTerritory;
    submitTerritoryLoading: boolean;
    showChangeTerritoryState: boolean;
    selectedState: MapistoState;
}
class EditTerritoryPageUnrouted extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            territory: undefined,
            modifiedTerritory: undefined,
            showChangeTerritoryState: false,
            selectedState: undefined,
            submitTerritoryLoading: false
        };
    }
    render() {
        const territory = this.state.territory;
        return (
            <div>
                <Header />
                <div className="container">
                    {
                        territory && (
                            <div className="row d-flex">
                                <div className="col-6">
                                    <h2 className="text-center">
                                        Territory
                                </h2>
                                    <h3 className="text-center">{moment(territory.validityStart).format('YYYY-MM-DD')}
                                        &nbsp;to&nbsp;
                                     {moment(territory.validityEnd).format('YYYY-MM-DD')}</h3>
                                    <FocusedOnTerritoryMap territory={territory} />
                                    <Form onSubmitCapture={this.submitTerritory} className="mt-4">
                                        <TerritoryInput
                                            value={this.state.modifiedTerritory}
                                            onChange={t => this.setState({ modifiedTerritory: t })}
                                        />
                                        <Button htmlType="submit" type="primary" loading={this.state.submitTerritoryLoading}
                                            className="mt-2" icon={<SaveOutlined />}>
                                            Save modifications
                                        </Button>
                                    </Form>
                                    <Button className="mt-5" type="primary" danger onClick={this.removeTerritory} >Remove the territory</Button>

                                </div>
                                <div className="col-6">
                                    <h2 className="text-center">
                                        Sovereign State
                                </h2>
                                    <div className="state-name">
                                        <h3 className="text-center">
                                            {territory.mpState.getName(territory.validityStart) ?
                                                territory.mpState.getName(territory.validityStart)
                                                :
                                                'Name unknown'
                                            }
                                        </h3>
                                        <Dropdown.Button
                                            className='edit-state-button'
                                            icon={<EditOutlined />} trigger={['click']} overlay={
                                                <Menu>
                                                    <Menu.Item onClick={() => this.setState({
                                                        showChangeTerritoryState: true
                                                    })}>
                                                        Change the territory's sovereign state
                                                    </Menu.Item>
                                                    <Menu.Item  >
                                                        <Link to={`/edit_state/${territory.mpState.stateId}`}>
                                                            Edit state
                                                    </Link>
                                                    </Menu.Item>
                                                </Menu>

                                            } />

                                    </div>
                                    <FocusedOnStateMap mpState={this.state.territory.mpState} />
                                    {
                                        this.state.showChangeTerritoryState && this.renderChangeTerritoryBelonging()
                                    }

                                </div>

                            </div>
                        )
                    }
                    <div className="m-4 d-flex justify-content-center">
                        <Button type="primary" icon={<LeftOutlined />} href="/"> Back to map</Button>

                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.loadTerritory(this.getTerritoryId());
    }

    renderChangeTerritoryBelonging() {
        return (<div>

            <h2 className="mt-3 decorated-title">Or</h2>
            <p>The territory belongs to another sovereign state</p>
            <div>
                <StateSearch
                    className="col-12" limitedToTerritory={this.state.territory}
                    onSelectedState={st => this.setState({
                        selectedState: st
                    })} />
                <Button
                    className="mt-1"
                    type="primary" icon={<SaveOutlined />} onClick={this.reassignTerritory}>
                    Change the sovereign state
                    </Button>
            </div>
        </div>
        );
    }

    removeTerritory = () => {
        MapistoAPI.deleteTerritory(this.state.territory.territoryId).subscribe(
            () => this.props.history.goBack()
        )
    }

    reassignTerritory = () => {
        const t: MapistoTerritory = Object.create(this.state.territory);
        t.mpState = this.state.selectedState;
        MapistoAPI.editTerritory(t).subscribe(newTerritory => this.setState({
            territory: newTerritory,
            modifiedTerritory: newTerritory
        }));
    }

    private loadTerritory(territoryId: number) {
        MapistoAPI.loadTerritory(territoryId).subscribe(
            t => this.setState({
                territory: t,
                modifiedTerritory: t,
                selectedState: t.mpState
            })
        );
    }

    submitTerritory = () => {
        this.setState({
            submitTerritoryLoading: true
        })
        MapistoAPI.editTerritory(this.state.modifiedTerritory).subscribe(
            t => this.setState({
                territory: t,
                modifiedTerritory: t,
                selectedState: t.mpState,
                submitTerritoryLoading: false

            })
        );
    }
    private getTerritoryId() {
        return parseInt(this.props.match.params.territory_id, 10);
    }

}

export const EditTerritoryPage = withRouter(EditTerritoryPageUnrouted);
