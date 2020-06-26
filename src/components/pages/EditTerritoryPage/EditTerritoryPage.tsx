import React from 'react';
import { withRouter, RouteComponentProps } from 'react-router';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoAPI } from 'src/api/MapistoApi';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { Button, Tooltip } from 'antd';
import { SearchOutlined, EditOutlined, BackwardOutlined, LeftOutlined } from '@ant-design/icons';
import './EditTerritoryPage.css'
import { FocusedOnTerritoryMap } from 'src/components/map-components/FocusedOnTerritoryMap/FocusedOnTerritoryMap';
import { StateSearch } from 'src/components/StateSearch/StateSearch';
import { Link } from 'react-router-dom';
import { Header } from 'src/components/Header/Header';


type Props = RouteComponentProps<{ territory_id: string }>;
interface State {
    territory: MapistoTerritory;
}
class EditTerritoryPageUnrouted extends React.Component<Props, State> {

    constructor(props: Props) {
        super(props);
        this.state = {
            territory: undefined
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
                                        <Tooltip className="edit-state-button" title="Edit">
                                            <Link to={`/edit_state/${territory.mpState.stateId}`}>
                                                <Button
                                                    shape="circle" icon={<EditOutlined />} />
                                            </Link>
                                        </Tooltip>

                                    </div>
                                    <FocusedOnStateMap mpState={this.state.territory.mpState} />
                                    <h2 className="mt-3 decorated-title">
                                        Or
                                </h2>
                                    <p>
                                        The territory belongs to another sovereign state
                                </p>
                                    <div>

                                        <StateSearch className="col-12" limitedToTerritory={territory} />
                                    </div>

                                </div>
                                <div className="col-6">
                                    <h2 className="text-center">
                                        Territory
                                </h2>
                                    <h3 className="text-center">
                                        {territory.name ?
                                            territory.name
                                            :
                                            (
                                                territory.mpState.getName(territory.validityStart) ?
                                                    territory.mpState.getName(territory.validityStart)
                                                    :
                                                    'Name unknown'
                                            )
                                        }
                                    </h3>
                                    <FocusedOnTerritoryMap territory={territory} />

                                </div>

                            </div>
                        )
                    }
                    <div className="m-2 d-flex justify-content-center">
                        <Button type="primary" icon={<LeftOutlined />} href="/"> Back to map</Button>

                    </div>
                </div>
            </div>
        );
    }

    componentDidMount() {
        this.loadTerritory(this.getTerritoryId());
    }

    private loadTerritory(territoryId: number) {
        MapistoAPI.loadTerritory(territoryId).subscribe(
            t => this.setState({ territory: t })
        );
    }
    private getTerritoryId() {
        return parseInt(this.props.match.params.territory_id, 10);
    }

}

export const EditTerritoryPage = withRouter(EditTerritoryPageUnrouted);
