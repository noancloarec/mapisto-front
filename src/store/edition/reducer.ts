import { EditionState, EditionActionTypes, SELECT_STATE, SELECT_TERRITORY, CHANGE_EDITION_TYPE } from "./types";

const initialState: EditionState = {
    selectedState: null,
    selectedTerritory: null,
    editionType: null
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
        default:
            return state;
    }
}