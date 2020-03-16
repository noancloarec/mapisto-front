import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";
import { MapistoViewBox } from "src/interfaces/mapistoViewBox";
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
    bounding_box: MapistoViewBox;
}
