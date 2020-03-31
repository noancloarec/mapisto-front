export interface MainMapState {
    currentYear: number;
}

export const CHANGE_YEAR = 'CHANGE_YEAR';

interface ChangeYearAction {
    type: typeof CHANGE_YEAR;
    payload: number;
}


export type MainMapActionTypes = ChangeYearAction;