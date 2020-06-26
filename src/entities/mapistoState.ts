import { MapistoViewBox } from "./mapistoViewBox";
import { TimeDefinedEntity } from "./TimeDefinedEntity";
import { StateRepresentation } from "./StateRepresentation";
import { MapistoTerritory } from "./mapistoTerritory";

export class MapistoState extends TimeDefinedEntity {
    stateId: number;
    boundingBox: MapistoViewBox;
    representations: StateRepresentation[];

    constructor(validityStart: Date, validityEnd: Date,
        stateId: number,
        representations: StateRepresentation[],
        boundingBox: MapistoViewBox
    ) {
        super(validityStart, validityEnd);
        this.stateId = stateId;
        this.boundingBox = boundingBox;
        this.representations = representations;
    }

    getName(date = this.validityStart) {
        const rep = this.representations.find(r => r.validAt(date));
        if (!rep) {
            console.error("Cannot find name of state at ", date.toISOString(), this);
            return "Error";
        }
        return rep.name;
    }

    hasName(name: string): boolean {
        return this.representations.find(r => r.color.toLocaleLowerCase() === name.toLocaleLowerCase()) !== undefined;
    }

    getColor(date = this.validityStart) {
        const rep = this.representations.find(r => r.validAt(date));
        if (!rep) {
            console.log('no representation found for', this, 'at', date);
            return 'black';
        }
        return this.representations.find(r => r.validAt(date)).color;
    }
}

