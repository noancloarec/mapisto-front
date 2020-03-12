import { MapistoTerritory } from "../models/mapistoTerritory"

export const UPDATE_TIME = 'UPDATE_TIME'
export const UPDATE_LOADING_LAND_STATUS = 'UPDATE_LOADING_LAND_STATUS'
export const UPDATE_LOADING_TERRITORY_STATUS = 'UPDATE_LOADING_TERRITORY_STATUS'
export const SELECT_TERRITORY = 'SELECT_TERRITORY'
interface UpdateTimeAction {
    type: typeof UPDATE_TIME
    payload: Date
}

interface UpdateLoadingLandStatusAction {
    type: typeof UPDATE_LOADING_LAND_STATUS,
    payload: boolean
}
interface UpdateLoadingTerritoryStatusAction {
    type: typeof UPDATE_LOADING_TERRITORY_STATUS,
    payload: boolean
}

interface SelectTerritoryAction{
    type : typeof SELECT_TERRITORY,
    payload : MapistoTerritory
}
export type ActionTypes = UpdateTimeAction | UpdateLoadingLandStatusAction | UpdateLoadingTerritoryStatusAction | SelectTerritoryAction
