import { TimeDefinedEntity } from "./TimeDefinedEntity";

export class StateRepresentation extends TimeDefinedEntity {
    color: string;
    name: string;
    constructor(validityStart: Date, validityEnd: Date, name: string, color: string) {
        super(validityStart, validityEnd);
        this.name = name;
        this.color = color;
    }
}