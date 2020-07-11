import React from 'react';
import './TerritoryPanel.css';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoState } from 'src/entities/mapistoState';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { Button } from 'antd';
import { Link } from 'react-router-dom';

type Props = {
    selectedTerritory: MapistoTerritory;
    year: number;
    onClosePanel: () => void;
};

interface State {
    selectedState: MapistoState;
}

export const TerritoryPanel: React.FC<Props> = (props: Props) => {
    return (
        <div className={"territory-panel " + (props.selectedTerritory ? "opened" : "")}>
            {props.selectedTerritory && renderTerritoryDetails(props.selectedTerritory, props.onClosePanel)}
        </div>
    );
};

const renderActionButtons = (territory: MapistoTerritory) => {
    return (
        <div className="action-buttons d-flex justify-content-center">
            <Link to={`/edit_territory/${territory.territoryId}`}>
                <Button>Edit</Button>
            </Link>
            {!territory.mpState.representations.find(r => !!r.name) &&
                <Link to={`/edit_state/${territory.mpState.stateId}`}>
                    <Button>Link to a state</Button>
                </Link>

            }
        </div >
    );
};

const renderTerritoryDetails = (territory: MapistoTerritory, onClosePanel: () => void) => {
    return (
        <div className="d-flex flex-column justify-content-between">
            <div>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-outline-dark" onClick={onClosePanel}>
                        <i className="fa fa-times" />
                    </button>
                </div>

                {
                    territory.mpState.getName(territory.validityStart) ? (
                        <div>
                            <h1>{territory.mpState.getName(territory.validityStart)}</h1>
                            <h2 className="text-center">
                                {territory.mpState.startYear} -&nbsp;
                                    {territory.mpState.endYear < 2018 ? territory.mpState.endYear : ''}
                            </h2>
                        </div>
                    ) :
                        (
                            <h1>
                                We could not figure out what this is yet
                                </h1>
                        )
                }
                <div className="thumbnail-in-panel">
                    <FocusedOnStateMap
                        mpState={territory.mpState}
                    />
                </div>
                {territory.mpState.getName(territory.validityStart) && (
                    <Link to={`/movie/${territory.mpState.stateId}`}>
                        <h3 className="text-center dotted-button">
                            {territory.mpState.getName(territory.validityStart)} : Every year
                        </h3>
                    </Link>

                )}
            </div>
            {renderActionButtons(territory)}
        </div >
    );
};
