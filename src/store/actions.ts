import { ActionTypes, UPDATE_TIME, UPDATE_LOADING_LAND_STATUS, UPDATE_LOADING_TERRITORY_STATUS , SELECT_TERRITORY} from "./types";
import { MapistoTerritory } from "../models/mapistoTerritory";

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

export function selectTerritory(territory : MapistoTerritory) : ActionTypes {
  return {
    type : SELECT_TERRITORY,
    payload : territory
  }
}