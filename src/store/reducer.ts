import { UPDATE_TIME, ActionTypes, UPDATE_LOADING_LAND_STATUS, UPDATE_LOADING_TERRITORY_STATUS, SELECT_TERRITORY, START_RENAMING, ASK_FOR_EDITION_TYPE, CANCEL_EDITION, FINISH_EDITION, UPDATE_MPSTATES } from "./types";
import { MapistoTerritory } from "@interfaces/mapistoTerritory";
import { MapistoState } from "@interfaces/mapistoState";
import { EditionState } from "components/EditingPanel/EditingPanel";
export interface RootState {
  mpStates : MapistoState[],
  current_date: Date,
  lands_loading: boolean,
  territories_loading: boolean,
  selectedTerritory : MapistoTerritory,
  editionType : EditionState
  selectedState : MapistoState
}
const initialState: RootState = {
  mpStates : [],
  current_date: new Date('1918-01-01'),
  lands_loading: false,
  territories_loading: false,
  selectedTerritory : null,
  selectedState : null,
  editionType : null
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
        selectedState : action.payload,
        editionType : EditionState.RenamingMapistoState
      }
    case ASK_FOR_EDITION_TYPE:
      return {
        ...state,
        selectedState : action.payload,
        editionType : EditionState.AskingForEditionType
      }
    case CANCEL_EDITION:
      return {
        ...state,
        editionType : null,
      }
    case FINISH_EDITION :
        return {
          ...state,
          editionType : null,
          selectedState : action.payload
        }
    case UPDATE_MPSTATES:
      return {
        ...state,
        mpStates : action.payload
      }
  }
  return state;
}

function selectTerritory(state : RootState, territory : MapistoTerritory) : RootState{
  const mpState = state.mpStates.find(mpState => mpState.territories.find(t => t.territory_id === territory.territory_id) !== undefined)
  if(!mpState){
    console.error(`Could not find a state which contains the territory ${territory.territory_id}`)
    return state;
  }
  return{
    ...state,
    selectedTerritory : territory,
    selectedState : mpState
  }
}
export default rootReducer;
