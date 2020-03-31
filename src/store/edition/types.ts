import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { MapistoState } from "src/entities/mapistoState";

export interface EditionState {
    selectedTerritory: MapistoTerritory;
    selectedState: MapistoState;
    editionType: EditionType;
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

export type EditionActionTypes = SelectStateAction |
    SelectTerritoryAction |
    ChangeEditionTypeAction;
