import { MainMapActionTypes, CHANGE_YEAR } from "./types";
export function changeYear(year: number): MainMapActionTypes {
    return {
        type: CHANGE_YEAR,
        payload: year
    };
}