import {
  ActionTypes,
  UPDATE_TIME,
  UPDATE_LOADING_LAND_STATUS,
  UPDATE_LOADING_TERRITORY_STATUS,
  SELECT_TERRITORY,
  START_RENAMING,
  ASK_FOR_EDITION_TYPE,
  CANCEL_EDITION,
  FINISH_EDITION,
  UPDATE_MPSTATES,
  UPDATE_LANDS
} from "./types";
import { MapistoTerritory } from "interfaces/mapistoTerritory";
import { MapistoState } from "interfaces/mapistoState";
import { Land } from "interfaces/Land";

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

export function selectTerritory(territory: MapistoTerritory): ActionTypes {
  return {
    type: SELECT_TERRITORY,
    payload: territory
  }
}

export function startRenaming(state: MapistoState): ActionTypes {
  return {
    type: START_RENAMING,
    payload: state
  }
}

export function askForEditingType(state: MapistoState): ActionTypes {
  return {
    type: ASK_FOR_EDITION_TYPE,
    payload: state
  }
}

export function cancelEdition(): ActionTypes {
  return {
    type: CANCEL_EDITION
  }
}

export function finishEdition(modifiedState: MapistoState): ActionTypes {
  return {
    type: FINISH_EDITION,
    payload: modifiedState
  }
}

export function updateMpStates(newStates: MapistoState[]): ActionTypes {
  return {
    type: UPDATE_MPSTATES,
    payload: newStates
  }
}

export function updateLands(newLands: Land[]): ActionTypes {
  return {
    type: UPDATE_LANDS,
    payload: newLands
  }
}