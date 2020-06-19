import { TimeDefinedEntity } from "./TimeDefinedEntity";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { MapistoState } from "./mapistoState";

export class MapistoTerritory extends TimeDefinedEntity {
    dPath: string;
    territoryId: number;
    precisionLevel: number;
    boundingBox: ViewBoxLike;
    mpState: MapistoState;
    color: string;
    name: string;

    constructor(validityStart: Date, validityEnd: Date,
        dPath: string,
        territoryId: number,
        precisionLevel: number,
        boundingBox: ViewBoxLike,
        color: string,
        name: string,
        mpState: MapistoState,
    ) {
        super(validityStart, validityEnd);
        this.territoryId = territoryId;
        this.dPath = dPath;
        this.precisionLevel = precisionLevel;
        this.boundingBox = boundingBox;
        this.mpState = mpState;
        this.color = color;
        this.name = name;
    }


}