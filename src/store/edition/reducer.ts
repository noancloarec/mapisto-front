import { EditionState, EditionActionTypes, SELECT_STATE, SELECT_TERRITORY, CHANGE_EDITION_TYPE, FINISH_SUCCESSFUL_EDITION, FIT_SELECTED_TO_YEAR } from "./types";

const initialState: EditionState = {
    selectedState: null,
    selectedTerritory: null,
    editionType: null,
    mapVersion: "0"
};

export function editionReducer(
    state = initialState,
    action: EditionActionTypes
): EditionState {
    switch (action.type) {
        case SELECT_STATE:
            return {
                ...state,
                selectedState: action.payload
            };
        case SELECT_TERRITORY:
            return {
                ...state,
                selectedTerritory: action.payload
            };
        case CHANGE_EDITION_TYPE:
            return {
                ...state,
                editionType: action.payload
            };
        case FINISH_SUCCESSFUL_EDITION:
            return {
                ...state,
                selectedState: null,
                selectedTerritory: null,
                editionType: null,
                mapVersion: `${parseInt(state.mapVersion, 10) + 1}`
            };
        case FIT_SELECTED_TO_YEAR:
            return {
                ...state,
                selectedTerritory:
                    !state.selectedTerritory || state.selectedTerritory.isOutdated(action.payload) ?
                        null : state.selectedTerritory,
                selectedState:
                    !state.selectedState || state.selectedState.isOutdated(action.payload) ?
                        null : state.selectedState
            };
        default:
            return state;
    }
}