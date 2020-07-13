import React from 'react';
import './TerritoryPanel.css';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { Button } from 'antd';
import { Link } from 'react-router-dom';
import { dateFromYear } from 'src/utils/date_utils';

type Props = {
    selectedTerritory: MapistoTerritory;
    year: number;
    onClosePanel: () => void;
};

export const TerritoryPanel: React.FC<Props> = (props: Props) => {
    const dateForNameDisplay = dateFromYear(props.year);
    return (
        <div className={"territory-panel " + (props.selectedTerritory ? "opened" : "")}>
            {props.selectedTerritory &&
                renderTerritoryDetails(props.selectedTerritory, dateForNameDisplay, props.onClosePanel)}
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

const renderTerritoryDetails = (territory: MapistoTerritory, dateForNameDisplay: Date, onClosePanel: () => void) => {
    const mpStateName = territory.mpState.getName(dateForNameDisplay);
    return (
        <div className="d-flex flex-column justify-content-between">
            <div>
                <div className="d-flex justify-content-end">
                    <button className="btn btn-outline-dark" onClick={onClosePanel}>
                        <i className="fa fa-times" />
                    </button>
                </div>

                {
                    mpStateName ? (
                        <div>
                            <h1>{territory.name ? territory.name : mpStateName}</h1>
                            {
                                territory.name && (
                                    <h2 className="text-center">({mpStateName})</h2>
                                )
                            }
                            <h2 className="text-center">
                                {territory.mpState.startYear} -&nbsp;
                                    {territory.mpState.endYear < 2018 ? territory.mpState.endYear : 'Today'}
                            </h2>
                        </div>
                    ) :
                        (
                            <h1>
                                Unknown
                                </h1>
                        )
                }
                <div className="thumbnail-in-panel">
                    <FocusedOnStateMap
                        mpState={territory.mpState}
                    />
                </div>
                {mpStateName && (
                    <Link to={`/movie/${territory.mpState.stateId}`}>
                        <h3 className="text-center dotted-button">
                            {mpStateName} : Every year
                        </h3>
                    </Link>

                )}
            </div>
            {renderActionButtons(territory)}
        </div >
    );
};
