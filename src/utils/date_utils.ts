export function dateFromYear(year: number): Date {
    return new Date(new Date("0001-01-01T00:00:00+0000").setUTCFullYear(year));
}

export function yearToISOString(year: number): string {
    const longyear = "0000" + year;
    return longyear.substr(longyear.length - 4) + "-01-01";

}