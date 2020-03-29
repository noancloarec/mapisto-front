import { TimeDefinedEntity } from "./TimeDefinedEntity";
import { ViewBoxLike } from "@svgdotjs/svg.js";

export class MapistoTerritory extends TimeDefinedEntity {
    dPath: string;
    territoryId: number;
    precisionLevel: number;
    boundingBox: ViewBoxLike;

    constructor(validityStart: Date, validityEnd: Date,
        dPath: string,
        territoryId: number,
        precisionLevel: number,
        boundingBox: ViewBoxLike
    ) {
        super(validityStart, validityEnd);
        this.territoryId = territoryId;
        this.dPath = dPath;
        this.precisionLevel = precisionLevel;
        this.boundingBox = boundingBox;
    }


}