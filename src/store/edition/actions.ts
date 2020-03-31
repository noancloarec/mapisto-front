import { EditionActionTypes, SELECT_TERRITORY, SELECT_STATE, EditionType, CHANGE_EDITION_TYPE } from "./types";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { MapistoState } from "src/entities/mapistoState";

export function selectTerritory(territory: MapistoTerritory): EditionActionTypes {
    return {
        type: SELECT_TERRITORY,
        payload: territory
    };
}
export function selectState(mpState: MapistoState): EditionActionTypes {
    return {
        type: SELECT_STATE,
        payload: mpState
    };
}

export function changeEditionType(editionType: EditionType) {
    return {
        type: CHANGE_EDITION_TYPE,
        payload: editionType
    };
}