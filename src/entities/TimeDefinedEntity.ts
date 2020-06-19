import { dateFromYear } from "src/utils/date_utils";

export class TimeDefinedEntity {
    validityStart: Date;
    validityEnd: Date;
    get startYear(): number {
        if (this.validityStart.getUTCDate() === 1 && this.validityStart.getUTCMonth() === 0) {
            return this.validityStart.getUTCFullYear() - 1;
        } else {
            return this.validityStart.getUTCFullYear();
        }
    }
    get endYear(): number {
        return this.validityEnd.getUTCFullYear() - 1;
    }
    constructor(validityStart: Date, validityEnd: Date) {
        this.validityStart = validityStart;
        this.validityEnd = validityEnd;
    }

    overLapsWith(other: TimeDefinedEntity) {
        return this.validityStart < other.validityEnd && this.validityEnd > other.validityEnd;
    }

    isOutdated(year: number): boolean {
        const d = dateFromYear(year);
        return this.validityStart > d || this.validityEnd <= d;
    }
    validAt(d: Date) {
        return this.validityStart <= d && this.validityEnd > d;
    }
    compare(b: TimeDefinedEntity): number {
        return this.validityStart > b.validityStart ? 1 : -1;
    }


}