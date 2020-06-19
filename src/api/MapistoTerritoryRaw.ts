import { MapistoViewBox } from "src/entities/mapistoViewBox";

/**
 * A Mapisto territory representation, as returned by the API
 */
export interface MapistoTerritoryRaw {
    validity_start: string;
    validity_end: string;
    d_path: string;
    territory_id: number;
    bounding_box: MapistoViewBox;
    state_id?: number;
    color: string;
    name: string;
}
