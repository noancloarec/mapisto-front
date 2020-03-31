import { MainMapState, MainMapActionTypes, CHANGE_YEAR } from "./types";

const initialState: MainMapState = {
    currentYear: 1918
};

export function mainMapReducer(
    state = initialState,
    action: MainMapActionTypes
): MainMapState {
    switch (action.type) {
        case CHANGE_YEAR:
            return {
                ...state,
                currentYear: action.payload
            };
        default:
            return state;
    }
}