import { MapistoViewBox } from "src/entities/mapistoViewBox";
import { StateRepresentationRaw } from "./StateRepresentationRaw";
/**
 * A Mapisto state representation, as returned by the API
 */
export interface MapistoStateRaw {
    state_id: number;
    validity_start: string;
    validity_end: string;
    bounding_box: MapistoViewBox;
    representations: StateRepresentationRaw[]
}
