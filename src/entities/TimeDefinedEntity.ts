import { dateFromYear } from "src/utils/date_utils";

export class TimeDefinedEntity {
    validityStart: Date;
    validityEnd: Date;
    constructor(validityStart: Date, validityEnd: Date) {
        this.validityStart = validityStart;
        this.validityEnd = validityEnd;
    }
    isOutdated(year: number): boolean {
        const d = dateFromYear(year);
        return this.validityStart > d || this.validityEnd <= d;
    }
    compare(b: TimeDefinedEntity): number {
        return this.validityStart > b.validityStart ? 1 : -1;
    }
}