import { MapistoTerritory } from "./mapistoTerritory";
import { MapistoViewBox } from "./mapistoViewBox";

export interface MapistoState {
    state_id: number;
    name: string;
    territories?: MapistoTerritory[];
    color?: string;
    validity_start?: Date;
    validity_end?: Date;
    bounding_box: MapistoViewBox;
}