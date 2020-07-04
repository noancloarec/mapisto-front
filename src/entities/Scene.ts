import { TimeDefinedEntity } from "./TimeDefinedEntity";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { Land } from "./Land";
import { MapistoTerritory } from "./mapistoTerritory";

export class Scene extends TimeDefinedEntity {
    territories: MapistoTerritory[];
    bbox: ViewBoxLike;
    lands: Land[];
    constructor(
        start: Date,
        end: Date,
        territories: MapistoTerritory[],
        bbox: ViewBoxLike,
        lands: Land[]) {
        super(start, end);
        this.territories = territories;
        this.bbox = bbox;
        this.lands = lands;
    }

    getYear(year: number): MapistoTerritory[] {
        return this.territories.filter(t => !t.isOutdated(year));
    }
}