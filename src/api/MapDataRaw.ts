import { MapistoStateRaw } from "./MapistoStateRaw";
import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";
import { ViewBoxLike } from "@svgdotjs/svg.js";

export interface MapDataRaw {
    states: MapistoStateRaw[];
    territories: MapistoTerritoryRaw[];
    bounding_box?: ViewBoxLike;
    date: string;
}
