// Adding 1 to the year so 1914 becomes valid from 1915-01-01 midnight
// Assuming the user typing 1914 wants to see what happened in 1914,
// so they want to see how was the world at the end of 1914, which is equivalent to how it was at 1915-01-01
export function dateFromYear(year: number): Date {
    return new Date(new Date("0001-01-01T00:00:00+0000").setUTCFullYear(year + 1));
}

export function yearToISOString(year: number): string {
    const longyear = "0000" + (year + 1);
    return longyear.substr(longyear.length - 4) + "-01-01";

}