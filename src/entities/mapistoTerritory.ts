import { TimeDefinedEntity } from "./TimeDefinedEntity";
import { ViewBoxLike } from "@svgdotjs/svg.js";

export class MapistoTerritory extends TimeDefinedEntity {
    dPath: string;
    territoryId: number;
    precisionLevel: number;
    boundingBox: ViewBoxLike;
    stateId: number;

    constructor(validityStart: Date, validityEnd: Date,
        dPath: string,
        territoryId: number,
        precisionLevel: number,
        boundingBox: ViewBoxLike,
        stateId: number = -1
    ) {
        super(validityStart, validityEnd);
        this.territoryId = territoryId;
        this.dPath = dPath;
        this.precisionLevel = precisionLevel;
        this.boundingBox = boundingBox;
        this.stateId = stateId;
    }


}