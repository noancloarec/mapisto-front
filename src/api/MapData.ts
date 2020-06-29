import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { ViewBoxLike } from "@svgdotjs/svg.js";

export interface MapData {
    territories: MapistoTerritory[];
    boundingBox?: ViewBoxLike;
    date: Date;
}
