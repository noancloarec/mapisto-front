import { MapistoStateRaw } from "./MapistoStateRaw";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { LandRaw } from "./LandRaw";

export interface SceneRaw {
    validity_start: string;
    validity_end: string;
    states: MapistoStateRaw[];
    bounding_box: ViewBoxLike;
    lands: LandRaw[];
}