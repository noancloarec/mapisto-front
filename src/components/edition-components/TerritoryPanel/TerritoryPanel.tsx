import React from 'react';
import './TerritoryPanel.css';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { MapistoState } from 'src/entities/mapistoState';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { dateFromYear } from 'src/utils/date_utils';
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
    const name = territory.mpState.getName(territory.validityStart);
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
                    <h3 className="text-center">
                        <a className="dotted-button"
                            href={`/movie/${territory.mpState.stateId}`}>
                            {territory.mpState.getName(territory.validityStart)} : Every year
                            </a>
                    </h3>

                )}
            </div>
            {renderActionButtons(territory)}
        </div >
    );
};




/**
 * Maps the redux state to the props of the loading Icon
 * @param state The redux state
 */
// const mapStateToProps = (state: RootState): StateProps => ({
//     selectedTerritory: state.edition.selectedTerritory,
//     year: state.mainMap.currentYear,
// });

// const mapDispatchToProps: DispatchProps = {
//     onSelectedStateLoaded: (st: MapistoState) => selectState(st),
//     startTerritoryEdition: () => changeEditionType(EditionType.AskRenameOrExtendTerritory),
//     showSelectedState: () => changeEditionType(EditionType.DisplayState),
//     startStateNaming: () => changeEditionType(EditionType.RenameState),
//     closePanel: () => selectTerritory(null)
// };
// export const TerritoryPanelConnected = connect(
//     mapStateToProps,
//     mapDispatchToProps
// )(TerritoryPanel);