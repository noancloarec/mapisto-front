export function dateFromYear(year: number) {
    return new Date(new Date("0001-01-01T00:00:00+0000").setUTCFullYear(year));
}