import { MainMapState, MainMapActionTypes, CHANGE_YEAR } from "./types";

const initialState: MainMapState = {
    currentYear: Math.random() * 300 + 1700
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