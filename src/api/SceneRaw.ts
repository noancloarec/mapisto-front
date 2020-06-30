import { MapistoStateRaw } from "./MapistoStateRaw";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { LandRaw } from "./LandRaw";
import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";

export interface SceneRaw {
    validity_start: string;
    validity_end: string;
    states: MapistoStateRaw[];
    territories: MapistoTerritoryRaw[];
    bounding_box: ViewBoxLike;
    lands: LandRaw[];
}