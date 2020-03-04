import { ActionTypes, UPDATE_TIME, UPDATE_LOADING_LAND_STATUS, UPDATE_LOADING_TERRITORY_STATUS } from "./types";

export function updateTime(newDate: Date): ActionTypes {
  return { type: UPDATE_TIME, payload: newDate }
};
export function updateLoadingLandStatus(newStatus: boolean): ActionTypes {
  return {
    type: UPDATE_LOADING_LAND_STATUS,
    payload: newStatus
  }
}
export function updateLoadingTerritoryStatus(newStatus: boolean): ActionTypes {
  return {
    type: UPDATE_LOADING_TERRITORY_STATUS,
    payload: newStatus
  }
}