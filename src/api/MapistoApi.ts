import { Observable, from } from "rxjs";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { MapistoState } from "src/entities/mapistoState";
import axios from 'axios';
import { config } from "src/config";
import { MapistoStateRaw } from "./MapistoStateRaw";
import { map, tap } from "rxjs/operators";
import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";
import { Land } from "src/entities/Land";
import { LandRaw } from "./LandRaw";
import { yearToISOString } from "src/utils/date_utils";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { SceneRaw } from "./SceneRaw";
import { Scene } from "src/entities/Scene";

export class MapistoAPI {

    static loadStates(
        year: number,
        precisionLevel: number,
        bbox: ViewBoxLike
    ): Observable<MapistoState[]> {
        return from(
            axios.get<MapistoStateRaw[]>(`${config.api_path}/map`, {
                params: {
                    date: yearToISOString(year),
                    precision_in_km: precisionLevel,
                    min_x: bbox.x,
                    max_x: bbox.x + bbox.width,
                    min_y: bbox.y,
                    max_y: bbox.y + bbox.height
                }
            })
        ).pipe(
            map(res => res.data),
            map(res => res.map(stateRaw => parseState(stateRaw, precisionLevel)))
        );
    }
    static loadState(stateId: number, year: number): Observable<MapistoState> {
        return from(
            axios.get<MapistoStateRaw>(`${config.api_path}/state/${stateId}`, {
                params: {
                    date: yearToISOString(year)
                }
            })
        ).pipe(
            map(res => parseState(res.data, Math.min(...config.precision_levels))),
        );
    }
    static loadLands(
        precisionLevel: number,
        bbox: ViewBoxLike
    ): Observable<Land[]> {
        return from(
            axios.get<LandRaw[]>(`${config.api_path}/land`, {
                params: {
                    precision_in_km: precisionLevel,
                    min_x: bbox.x,
                    max_x: bbox.x + bbox.width,
                    min_y: bbox.y,
                    max_y: bbox.y + bbox.height
                }
            })
        ).pipe(
            map(res => res.data),
            map(lands => lands.map(raw => parseLand(raw, precisionLevel))),
        );
    }

    static getConcurrentStates(stateId: number, startYear: number, endYear: number): Observable<MapistoState[]> {
        return from(
            axios.get<MapistoStateRaw[]>(`${config.api_path}/state/${stateId}/concurrent_states`, {
                params: {
                    newStart: yearToISOString(startYear),
                    newEnd: yearToISOString(endYear)
                }
            })
        ).pipe(
            map(res => res.data),
            map(states => states.map(raw => parseState(raw, null))),
            map(states => states.sort((a, b) => a.compare(b)))
        );
    }

    static getConcurrentTerritories(
        territoryId: number, capital: DOMPoint, startYear: number, endYear: number
    ): Observable<MapistoTerritory[]> {
        return from(
            axios.get<MapistoTerritoryRaw[]>(`${config.api_path}/territory/${territoryId}/concurrent_territories`, {
                params: {
                    newStart: yearToISOString(startYear),
                    newEnd: yearToISOString(endYear),
                    capital_x: capital.x,
                    capital_y: capital.y
                }
            })).pipe(
                map(res => res.data.map(raw => parseTerritory(raw, null)))
            );
    }

    static getStateFromTerritory(territoryId: number, year: number): Observable<MapistoState> {
        return from(
            axios.get<MapistoStateRaw>(`${config.api_path}/state/from_territory/${territoryId}`, {
                params: {
                    date: yearToISOString(year)
                }
            })
        ).pipe(
            map(res => parseState(res.data, null))
        );
    }

    static extendState(
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
                    newStart: yearToISOString(newStart),
                    newEnd: yearToISOString(newEnd)
                }
            }))
            .pipe(
                map(res => res.data.removed_states.map(r => parseState(r, null)))
            );
    }

    static changeTerritoryBelonging(territoryId: number, newStateId: number): Observable<number> {
        return from(
            axios.put<number>(`${config.api_path}/territory/${territoryId}/reassign_to/${newStateId}`)
        ).pipe(
            map(res => res.data)
        );
    }

    static mergeStates(toBeAbsorbedId: number, toAbsordID: number): Observable<number> {
        return from(
            axios.put<number>(`${config.api_path}/state/${toAbsordID}/absorb/${toBeAbsorbedId}`)
        ).pipe(
            map(res => res.data)
        );

    }

    static createState(toCreate: MapistoState): Observable<number> {
        return from(
            axios.post<number>(`${config.api_path}/state`,
                {
                    name: toCreate.name,
                    color: toCreate.color,
                },
                {
                    params: {
                        validity_start: toCreate.validityStart,
                        validity_end: toCreate.validityEnd
                    }
                }
            )).pipe(
                map(res => res.data)
            );
    }

    static extendTerritory(
        territoryId: number,
        newStart: number,
        newEnd: number,
        territoryIdsToDelete: number[]
    ): Observable<MapistoTerritory> {
        return from(
            axios.put<MapistoTerritoryRaw>(`${config.api_path}/territory/${territoryId}/extend`, territoryIdsToDelete, {
                params: {
                    newStart: yearToISOString(newStart),
                    newEnd: yearToISOString(newEnd)
                }
            }))
            .pipe(
                map(res => parseTerritory(res.data, null))
            );

    }

    static putState(modifiedState: MapistoState): Observable<void> {
        return from(
            axios.put<string>(
                `${config.api_path}/state`,
                { state_id: modifiedState.stateId, name: modifiedState.name, color: modifiedState.color },
                {
                    params: {
                        validity_start: modifiedState.validityStart,
                        validity_end: modifiedState.validityEnd
                    }
                })).pipe(
                    map(_ => {
                        return;
                    })
                );
    }
    static searchState(pattern: string, start?: number, end?: number): Observable<MapistoState[]> {
        return from(
            axios.get<MapistoStateRaw[]>(`${config.api_path}/state_search`, {
                params: {
                    pattern,
                    start: start ? yearToISOString(start) : '',
                    end: end ? yearToISOString(end) : ''
                }
            })
        ).pipe(
            map(res => res.data.map(s => parseState(s, null)))
        );
    }

    static getVideo(stateId: number): Observable<Scene[]> {
        return from(
            axios.get<SceneRaw[]>(`${config.api_path}/movie/${stateId}`)
        ).pipe(
            map(res => res.data.map(s => parseScene(s))),
            tap((scenes: Scene[]) => scenes.forEach(s => console.log(`ratio : ${s.bbox.width / s.bbox.height}`)))
        );
    }
}



function parseLand(raw: LandRaw, precisionLevel: number): Land {
    return {
        ...raw,
        precision_level: precisionLevel
    };
}

function parseState(raw: MapistoStateRaw, precisionLevel: number): MapistoState {
    return new MapistoState(
        new Date(raw.validity_start + "Z"),
        new Date(raw.validity_end + "Z"),
        raw.state_id,
        raw.name,
        raw.territories ?
            raw.territories.map(territoryRaw => parseTerritory(territoryRaw, precisionLevel)) : undefined,
        raw.color,
        raw.bounding_box
    );

}

function parseTerritory(raw: MapistoTerritoryRaw, precisionLevel: number): MapistoTerritory {
    if (!raw.validity_start || !raw.validity_end) {
        console.error("Missing validity on territory");
        console.error(raw);
    }
    const res = new MapistoTerritory(
        new Date(raw.validity_start + "Z"),
        new Date(raw.validity_end + "Z"),
        raw.d_path,
        raw.territory_id,
        precisionLevel,
        raw.bounding_box,
        raw.state_id
    );
    return res;
}

function parseScene(raw: SceneRaw): Scene {
    return new Scene(
        new Date(raw.validity_start + "Z"),
        new Date(raw.validity_end + "Z"),
        raw.states.map(s => parseState(s, null)),
        raw.bounding_box,
        raw.lands.map(l => parseLand(l, null))
    );
}

