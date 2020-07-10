import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { Land } from "src/entities/Land";

export interface MapData {
    territories: MapistoTerritory[];
    boundingBox?: ViewBoxLike;
    date: Date;
}
