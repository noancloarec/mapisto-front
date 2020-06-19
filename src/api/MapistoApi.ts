import { Observable, from, of, throwError } from "rxjs";
import { ajax } from 'rxjs/ajax';
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { MapistoState } from "src/entities/mapistoState";
import axios from 'axios';
import { config } from "src/config";
import { MapistoStateRaw } from "./MapistoStateRaw";
import { map, switchMap, tap, catchError } from "rxjs/operators";
import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";
import { Land } from "src/entities/Land";
import { LandRaw } from "./LandRaw";
import { yearToISOString } from "src/utils/date_utils";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { SceneRaw } from "./SceneRaw";
import { Scene } from "src/entities/Scene";
import { MapistoPoint } from "src/entities/MapistoPoint";
import { StateRepresentationRaw } from "./StateRepresentationRaw";
import { StateRepresentation } from "src/entities/StateRepresentation";
interface StatesAndTerritories {
    states: MapistoState[];
    territories: MapistoTerritory[];
}

interface StatesAndTerritoriesRaw {
    states: MapistoStateRaw[];
    territories: MapistoTerritoryRaw[];
}
export class MapistoAPI {

    static loadMap(
        year: number,
        precisionLevel: number,
        bbox: ViewBoxLike
    ): Observable<StatesAndTerritories> {
        return from(
            axios.get<StatesAndTerritoriesRaw>(`${config.api_path}/map`, {
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
            map(res => parseStatesAndTerritories(res.data, precisionLevel)),
        );
    }

    static loadMapForState(stateId: number, year: number, pixelWidth: number)
        : Observable<StatesAndTerritories & { boundingBox: ViewBoxLike }> {
        return from(
            axios.get<StatesAndTerritoriesRaw & { bounding_box: ViewBoxLike }>(`${config.api_path}/map_for_state/${stateId}`, {
                params: {
                    date: yearToISOString(year),
                    pixel_width: pixelWidth,
                }
            })
        ).pipe(
            map(res => (
                { ...parseStatesAndTerritories(res.data, pixelWidth), boundingBox: res.data.bounding_box }
            ))
        );
    }
    static loadMapForTerritory(territoryId: number, year: number, pixelWidth: number)
        : Observable<StatesAndTerritories & { boundingBox: ViewBoxLike }> {
        return from(
            axios.get<StatesAndTerritoriesRaw & { bounding_box: ViewBoxLike }>(`${config.api_path}/map_for_territory/${territoryId}`, {
                params: {
                    date: yearToISOString(year),
                    pixel_width: pixelWidth,
                }
            })
        ).pipe(
            map(res => (
                { ...parseStatesAndTerritories(res.data, pixelWidth), boundingBox: res.data.bounding_box }
            ))
        );
    }

    static loadState(stateId: number): Observable<MapistoState> {
        return ajax.getJSON<MapistoStateRaw>(`${config.api_path}/state/${stateId}`)
            .pipe(
                map(res => parseState(res)),
            );
    }

    static loadTerritory(territoryId: number): Observable<MapistoTerritory> {
        // Loads the territory
        return ajax.getJSON<MapistoTerritoryRaw>(`${config.api_path}/territory/${territoryId}`).pipe(
            switchMap(res =>
                // Loads the state corresponding to the territory
                this.loadState(res.state_id).pipe(
                    // Takes the loaded state and puts it in the territory to return
                    map(state => parseTerritory(res, 0, state))
                )
            )
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
            map(states => states.map(raw => parseState(raw))),
            map(states => states.sort((a, b) => a.compare(b)))
        );
    }

    static getConcurrentTerritories(
        territoryId: number, capital: MapistoPoint, startYear: number, endYear: number
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
                map(res => res.data.map(raw => parseTerritory(raw, null, undefined)))
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
            map(res => parseState(res.data))
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
                map(res => res.data.removed_states.map(r => parseState(r)))
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
                toCreate
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
                map(res => parseTerritory(res.data, null, undefined))
            );

    }

    static putState(modifiedState: MapistoState): Observable<number> {
        return from(
            axios.put(`${config.api_path}/state`,
                stateJSON(modifiedState)
            )).pipe(
                catchError(e => throwError(e.response.data)),
                map(response => modifiedState.stateId)
            );
    }
    static searchState(pattern: string): Observable<MapistoState[]> {
        return from(
            axios.get<MapistoStateRaw[]>(`${config.api_path}/state_search`, {
                params: {
                    pattern,
                }
            })
        ).pipe(
            map(res => res.data.map(s => parseState(s)))
        );
    }

    static getVideo(stateId: number, onProgress?: (progress: number) => void): Observable<Scene[]> {
        return from(
            axios.get<SceneRaw[]>(`${config.api_path}/movie/${stateId}`,
                onProgress ? {
                    onDownloadProgress: event => onProgress(event.loaded / event.total)
                } : {}
            )
        ).pipe(
            map(res => res.data.map(s => parseScene(s))),
        );
    }
}



function parseLand(raw: LandRaw, precisionLevel: number): Land {
    return {
        ...raw,
        precision_level: precisionLevel
    };
}

function parseState(raw: MapistoStateRaw): MapistoState {
    return new MapistoState(
        new Date(raw.validity_start + "Z"),
        new Date(raw.validity_end + "Z"),
        raw.state_id,
        raw.representations.map(r => parseStateRepresentation(r)),
        raw.bounding_box
    );
}
function stateJSON(from: MapistoState): MapistoStateRaw {
    return {
        bounding_box: from.boundingBox,
        representations: from.representations.map(r => stateRepresentationJSON(r)),
        state_id: from.stateId,
        validity_end: from.validityEnd.toISOString(),
        validity_start: from.validityStart.toISOString()
    };
}

function parseStateRepresentation(raw: StateRepresentationRaw): StateRepresentation {
    return new StateRepresentation(
        new Date(raw.validity_start + "Z"),
        new Date(raw.validity_end + "Z"),
        raw.name,
        raw.color
    );
}
function stateRepresentationJSON(from: StateRepresentation): StateRepresentationRaw {
    return {
        color: from.color,
        name: from.name,
        validity_start: from.validityStart.toISOString(),
        validity_end: from.validityEnd.toISOString(),
    };
}

function parseTerritory(raw: MapistoTerritoryRaw, precisionLevel: number, mpState: MapistoState): MapistoTerritory {
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
        raw.color,
        raw.name,
        mpState
    );
    return res;
}

function parseScene(raw: SceneRaw): Scene {
    return new Scene(
        new Date(raw.validity_start + "Z"),
        new Date(raw.validity_end + "Z"),
        raw.states.map(s => parseState(s)),
        raw.bounding_box,
        raw.lands.map(l => parseLand(l, null))
    );
}

function parseStatesAndTerritories(raw: StatesAndTerritoriesRaw, precisionLevel: number): StatesAndTerritories {
    const mpStates = raw.states.map(r => parseState(r));

    const res = {
        states: mpStates,
        territories: raw.territories.map(
            t => parseTerritory(t, precisionLevel, mpStates.find(s => s.stateId === t.state_id))
        )
    };
    for (const t of res.territories) {
        t.mpState.getName(t.validityStart);
    }

    return res;
}

