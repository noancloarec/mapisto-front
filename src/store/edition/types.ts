import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { MapistoState } from "src/entities/mapistoState";

export interface EditionState {
    selectedTerritory: MapistoTerritory;
    selectedState: MapistoState;
    editionType: EditionType;
    mapVersion: string;
}

export enum EditionType {
    AskRenameOrExtendTerritory = 1,
    RenameStateOrTerritory,
    RenameTerritory,
    ExtendTerritoryPeriod,
    DisplayState,
    AskRenameOrExtendState,
    ExtendStatePeriod,
    RenameState,
}

export const SELECT_TERRITORY = 'SELECT_TERRITORY';
export const SELECT_STATE = 'SELECT_STATE';
export const CHANGE_EDITION_TYPE = 'CHANGE_EDITION_TYPE';
export const FINISH_SUCCESSFUL_EDITION = 'FINISH_SUCCESSFUL_EDITION';
export const FIT_SELECTED_TO_YEAR = 'FIT_SELECTED_TO_YEAR';
interface SelectTerritoryAction {
    type: typeof SELECT_TERRITORY;
    payload: MapistoTerritory;
}

interface SelectStateAction {
    type: typeof SELECT_STATE;
    payload: MapistoState;
}

interface ChangeEditionTypeAction {
    type: typeof CHANGE_EDITION_TYPE;
    payload: EditionType;
}

interface FinishSuccessfullEditionAction {
    type: typeof FINISH_SUCCESSFUL_EDITION;
}
interface FitSelectedToYearAction {
    type: typeof FIT_SELECTED_TO_YEAR;
    payload: number;
}

export type EditionActionTypes = SelectStateAction |
    SelectTerritoryAction |
    ChangeEditionTypeAction | FinishSuccessfullEditionAction | FitSelectedToYearAction;
