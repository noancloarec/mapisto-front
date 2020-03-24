import { Observable, from } from "rxjs";
import { MapistoTerritory } from "src/interfaces/mapistoTerritory";
import { MapistoState } from "src/interfaces/mapistoState";
import axios from 'axios';
import { config } from "src/config";
import { MapistoStateRaw } from "./MapistoStateRaw";
import { map } from "rxjs/operators";
import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";
import { Land } from "src/interfaces/Land";
import { LandRaw } from "./LandRaw";


export function loadStates(
    year: number,
    precisionLevel: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
): Observable<MapistoState[]> {
    return from(
        axios.get<MapistoStateRaw[]>(`${config.api_path}/map`, {
            params: {
                date: yearToDate(year),
                precision_in_km: precisionLevel,
                min_x: minX,
                max_x: maxX,
                min_y: minY,
                max_y: maxY
            }
        })
    ).pipe(
        map(res => res.data),
        map(res => res.map(stateRaw => parseState(stateRaw, precisionLevel)))
    );
}

export function loadState(stateId: number, year: number): Observable<MapistoState> {
    console.log(`Load state called with ${year}`);
    return from(
        axios.get<MapistoStateRaw>(`${config.api_path}/state/${stateId}`, {
            params: {
                date: yearToDate(year)
            }
        })
    ).pipe(
        map(res => parseState(res.data, Math.min(...config.precision_levels))),
    );
}

export function loadLands(
    precisionLevel: number,
    minX: number,
    maxX: number,
    minY: number,
    maxY: number
): Observable<Land[]> {
    return from(
        axios.get<LandRaw[]>(`${config.api_path}/land`, {
            params: {
                precision_in_km: precisionLevel,
                min_x: minX,
                max_x: maxX,
                min_y: minY,
                max_y: maxY

            }
        })
    ).pipe(
        map(res => res.data),
        map(lands => lands.map(raw => parseLand(raw, precisionLevel)))
    );
}

export function getConcurrentStates(stateId: number, startYear: number, endYear: number): Observable<MapistoState[]> {
    return from(
        axios.get<MapistoStateRaw[]>(`${config.api_path}/state/${stateId}/concurrent_states`, {
            params: {
                newStart: yearToDate(startYear),
                newEnd: yearToDate(endYear)
            }
        })
    ).pipe(
        map(res => res.data),
        map(states => states.map(raw => parseState(raw, null))),
        map(states => states.sort((a, b) => a.validity_start > b.validity_start ? 1 : -1))
    );
}

export function extendState(
    stateId: number,
    newStart: number,
    newEnd: number,
    statesToReassign: number[]
): Observable<MapistoState[]> {
    type servResponse =
        {
            removed_states: MapistoStateRaw[]
        };

    return from(
        axios.put<servResponse>(`${config.api_path}/state/${stateId}/extend`, statesToReassign, {
            params: {
                newStart: yearToDate(newStart),
                newEnd: yearToDate(newEnd)
            }
        }))
        .pipe(
            map(res => res.data.removed_states.map(r => parseState(r, null)))
        );

}

function parseLand(raw: LandRaw, precisionLevel: number): Land {
    return {
        ...raw,
        precision_level: precisionLevel
    };
}

function parseState(raw: MapistoStateRaw, precisionLevel: number): MapistoState {
    return {
        ...raw,
        validity_start: new Date(raw.validity_start + "Z"),
        validity_end: new Date(raw.validity_end + "Z"),
        territories: raw.territories ?
            raw.territories.map(territoryRaw => parseTerritory(territoryRaw, precisionLevel)) : undefined
    };
}

function parseTerritory(raw: MapistoTerritoryRaw, precisionLevel: number): MapistoTerritory {
    if (!raw.validity_start || !raw.validity_end) {
        console.error("Missing validity on territory");
        console.error(raw);
    }
    return {
        ...raw,
        validity_start: new Date(raw.validity_start + "Z"),
        validity_end: new Date(raw.validity_end + "Z"),
        precision_level: precisionLevel
    };
}

function yearToDate(year: number) {
    const longyear = "0000" + year;
    return longyear.substr(longyear.length - 4) + "-01-01";
}

