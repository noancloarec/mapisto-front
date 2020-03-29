import { MapistoTerritory } from "./mapistoTerritory";
import { MapistoViewBox } from "./mapistoViewBox";
import { TimeDefinedEntity } from "./TimeDefinedEntity";

export class MapistoState extends TimeDefinedEntity {
    stateId: number;
    name: string;
    territories?: MapistoTerritory[];
    color?: string;
    boundingBox: MapistoViewBox;

    constructor(validityStart: Date, validityEnd: Date,
        stateId: number,
        name: string,
        territories: MapistoTerritory[],
        color: string,
        boundingBox: MapistoViewBox
    ) {
        super(validityStart, validityEnd);
        this.stateId = stateId;
        this.name = name;
        this.territories = territories;
        this.color = color;
        this.boundingBox = boundingBox;
    }
}