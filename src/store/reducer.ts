import { UPDATE_TIME, ActionTypes, UPDATE_LOADING_LAND_STATUS, UPDATE_LOADING_TERRITORY_STATUS, SELECT_TERRITORY, START_RENAMING, ASK_FOR_EDITION_TYPE, CANCEL_EDITION, FINISH_EDITION, UPDATE_MPSTATES, UPDATE_LANDS } from "./types";
import { MapistoTerritory } from "interfaces/mapistoTerritory";
import { MapistoState } from "interfaces/mapistoState";
import { EditionState } from "components/EditingPanel/EditingPanel";
import { Land } from "interfaces/Land";
export interface RootState {
  mpStates: MapistoState[],
  lands : Land[],
  current_date: Date,
  lands_loading: boolean,
  territories_loading: boolean,
  selectedTerritory: MapistoTerritory,
  editionType: EditionState
  selectedState: MapistoState
}
const initialState: RootState = {
  mpStates: [],
  lands : [],
  current_date: new Date('1918-01-01'),
  lands_loading: false,
  territories_loading: false,
  selectedTerritory: null,
  selectedState: null,
  editionType: null
};
function rootReducer(state = initialState, action: ActionTypes): RootState {
  switch (action.type) {
    case UPDATE_TIME:
      return {
        ...state,
        current_date: action.payload
      }
    case UPDATE_LOADING_LAND_STATUS:
      return {
        ...state,
        lands_loading: action.payload
      }
    case UPDATE_LOADING_TERRITORY_STATUS:
      return {
        ...state,
        territories_loading: action.payload
      }
    case SELECT_TERRITORY:
      return selectTerritory(state, action.payload)

    case START_RENAMING:
      return {
        ...state,
        selectedState: action.payload,
        editionType: EditionState.RenamingMapistoState
      }
    case ASK_FOR_EDITION_TYPE:
      return {
        ...state,
        selectedState: action.payload,
        editionType: EditionState.AskingForEditionType
      }
    case CANCEL_EDITION:
      return {
        ...state,
        editionType: null,
      }
    case FINISH_EDITION:
      return {
        ...state,
        editionType: null,
        selectedState: action.payload,
        mpStates: [...state.mpStates.filter(s => s.state_id !== action.payload.state_id), action.payload]
      }
    case UPDATE_MPSTATES:
      return {
        ...state,
        mpStates: reduceMPStates(state, action.payload)
      }
    case UPDATE_LANDS:
      return {
        ...state,
        lands : reduceLands(state, action.payload)
      }
  }
  return state;
}

function selectTerritory(state: RootState, territory: MapistoTerritory): RootState {
  if(!territory){
    return {
      ...state,
      selectedState : null,
      selectedTerritory : null
    }
  }
  const mpState = state.mpStates.find(mpState => mpState.territories.find(t => t.territory_id === territory.territory_id) !== undefined)
  if (!mpState) {
    console.error(`Could not find a state which contains the territory ${territory.territory_id}`)
    return state;
  }
  return {
    ...state,
    selectedTerritory: territory,
    selectedState: mpState
  }
}

function reduceMPStates(state: RootState, newMpStates: MapistoState[]): MapistoState[] {
  let res = filterOutdatedStateAndTerritories(state.current_date, state.mpStates)
  for (const mpState of newMpStates) {
    const existingRepresentation = res.find(s => s.state_id === mpState.state_id)
    if (existingRepresentation) {
      const mergedRepresentation = mergeStateRepresentation(mpState, existingRepresentation)
      res[res.indexOf(existingRepresentation)] = mergedRepresentation
    } else {
      res.push(mpState);
    }
  }
  return res;
}

function mergeStateRepresentation(state_a: MapistoState, state_b: MapistoState): MapistoState {
  const res = [...state_a.territories]
  for (const territory of state_b.territories) {
    const concurrent = res.find(t => t.territory_id === territory.territory_id)
    if (concurrent && territory.precision_level < concurrent.precision_level) {
      // if territory is more precisie
      res[res.indexOf(concurrent)] = territory
    } else if (!concurrent) {
      res.push(territory)
    }
  }
  return {
    ...state_a,
    territories: res
  }

}

function filterOutdatedStateAndTerritories(time: Date, mpStates: MapistoState[]): MapistoState[] {
  let without_outdated_states = mpStates.filter(mpState => mpState.validity_start <= time && mpState.validity_end > time)
  return without_outdated_states.map(
    valid_state => ({
      ...valid_state,
      territories: valid_state.territories.filter(territory => territory.validity_start <= time && territory.validity_end >= time)
    })
  )
}

function reduceLands(state : RootState, lands: Land[]) : Land[]{
  const res = [...state.lands]
  for (const land of lands) {
    const concurrent = res.find(l => l.land_id === land.land_id)
    if (concurrent && land.precision_level < concurrent.precision_level) {
      // if land is more precisie
      res[res.indexOf(concurrent)] = land
    } else if (!concurrent) {
      res.push(land)
    }
  }
  return res

}
export default rootReducer;
