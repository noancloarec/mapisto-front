import { TimeDefinedEntity } from "./TimeDefinedEntity";
import { MapistoState } from "./mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import { Land } from "./Land";

export class Scene extends TimeDefinedEntity {
    mapEvolution: MapistoState[];
    bbox: ViewBoxLike;
    lands: Land[];
    constructor(start: Date, end: Date, mapEvolution: MapistoState[], bbox: ViewBoxLike, lands: Land[]) {
        super(start, end);
        this.mapEvolution = mapEvolution;
        this.bbox = bbox;
        this.lands = lands;
    }

    getYear(year: number): MapistoState[] {
        return this.mapEvolution.filter(s => !s.isOutdated(year)).map(
            s => {
                const res = Object.create(s);
                return res;
            }
        );
    }
}