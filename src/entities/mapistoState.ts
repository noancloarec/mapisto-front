import { MapistoViewBox } from "./mapistoViewBox";
import { TimeDefinedEntity } from "./TimeDefinedEntity";
import { StateRepresentation } from "./StateRepresentation";

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

    getRepresentation(date = this.validityStart){
        return this.representations.find(r => r.validAt(date))
    }

    getName(date = this.validityStart) {
        const rep = this.getRepresentation(date)
        if (!rep) {
            return "";
        }
        return rep.name;
    }

    hasName(name: string): boolean {
        return this.representations.find(r => r.color.toLocaleLowerCase() === name.toLocaleLowerCase()) !== undefined;
    }

    getColor(date = this.validityStart) {
        const rep = this.getRepresentation(date)
        if (!rep) {
            return 'black';
        }
        return rep.color;
    }
}

