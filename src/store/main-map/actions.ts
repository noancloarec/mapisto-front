import { MainMapActionTypes, CHANGE_YEAR } from "./types";
export function changeYear(year: number): MainMapActionTypes {
    console.log('redux year : ', year)
    return {
        type: CHANGE_YEAR,
        payload: year
    };
}