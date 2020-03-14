import { MapistoTerritory } from "src/interfaces/mapistoTerritory"
import { MapistoState } from "src/interfaces/mapistoState"
import { Land } from "src/interfaces/Land"

export const UPDATE_TIME = 'UPDATE_TIME'
export const UPDATE_LOADING_LAND_STATUS = 'UPDATE_LOADING_LAND_STATUS'
export const UPDATE_LOADING_TERRITORY_STATUS = 'UPDATE_LOADING_TERRITORY_STATUS'
export const SELECT_TERRITORY = 'SELECT_TERRITORY'
export const START_RENAMING = 'START_RENAMING'
export const CANCEL_EDITION = 'CANCEL_EDITION'
export const ASK_FOR_EDITION_TYPE = 'ASK_FOR_EDITION_TYPE'
export const FINISH_EDITION = 'FINISH_EDITION'
export const UPDATE_MPSTATES = 'UPDATE_MPSTATES'
export const UPDATE_LANDS = 'UPDATE_LANDS'
interface UpdateTimeAction {
    type: typeof UPDATE_TIME
    payload: Date
}

interface UpdateLandsAction {
    type: typeof UPDATE_LANDS,
    payload: Land[]
}

interface UpdateMPStatesAction {
    type: typeof UPDATE_MPSTATES,
    payload: MapistoState[]
}
interface UpdateLoadingLandStatusAction {
    type: typeof UPDATE_LOADING_LAND_STATUS,
    payload: boolean
}
interface UpdateLoadingTerritoryStatusAction {
    type: typeof UPDATE_LOADING_TERRITORY_STATUS,
    payload: boolean
}

interface SelectTerritoryAction {
    type: typeof SELECT_TERRITORY,
    payload: MapistoTerritory
}

interface StartRenamingAction {
    type: typeof START_RENAMING,
    payload: MapistoState
}
interface AskForEditionTypeAction {
    type: typeof ASK_FOR_EDITION_TYPE,
    payload: MapistoState
}
interface CancelEdition {
    type: typeof CANCEL_EDITION
}
interface FinishEdition {
    type: typeof FINISH_EDITION,
    payload: MapistoState
}
export type ActionTypes =
    UpdateTimeAction |
    AskForEditionTypeAction |
    UpdateLoadingLandStatusAction |
    UpdateLoadingTerritoryStatusAction |
    SelectTerritoryAction |
    StartRenamingAction |
    CancelEdition |
    FinishEdition |
    UpdateMPStatesAction |
    UpdateLandsAction
