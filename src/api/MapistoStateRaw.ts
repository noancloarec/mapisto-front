import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";

export interface MapistoStateRaw {
    state_id: number,
    name: string,
    color: string,
    validity_start: string,
    validity_end: string,
    territories: MapistoTerritoryRaw[]
};
