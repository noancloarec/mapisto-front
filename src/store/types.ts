export const UPDATE_TIME = 'UPDATE_TIME'
export const UPDATE_LOADING_LAND_STATUS = 'UPDATE_LOADING_LAND_STATUS'
export const UPDATE_LOADING_TERRITORY_STATUS = 'UPDATE_LOADING_TERRITORY_STATUS'
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
export type ActionTypes = UpdateTimeAction | UpdateLoadingLandStatusAction | UpdateLoadingTerritoryStatusAction
