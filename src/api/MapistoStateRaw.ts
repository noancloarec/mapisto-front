import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";
/**
 * A Mapisto state representation, as returned by the API
 */
export interface MapistoStateRaw {
    state_id: number;
    name: string;
    color: string;
    validity_start: string;
    validity_end: string;
    territories: MapistoTerritoryRaw[];
}
