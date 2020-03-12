import { UPDATE_TIME, ActionTypes, UPDATE_LOADING_LAND_STATUS, UPDATE_LOADING_TERRITORY_STATUS, SELECT_TERRITORY } from "./types";
import { MapistoTerritory } from "../models/mapistoTerritory";
export interface RootState {
  current_date: Date,
  lands_loading: boolean,
  territories_loading: boolean,
  selectedTerritory : MapistoTerritory
}
const initialState: RootState = {
  current_date: new Date('1918-01-01'),
  lands_loading: false,
  territories_loading: false,
  selectedTerritory : null
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
      return{
        ...state,
        selectedTerritory : action.payload
      }
  }
  return state;
}
export default rootReducer;
