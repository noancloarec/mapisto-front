import { Observable, from, of, throwError } from "rxjs";
import { ajax } from 'rxjs/ajax';
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { MapistoState } from "src/entities/mapistoState";
import axios from 'axios';
import { config } from "src/config";
import { MapistoStateRaw } from "./MapistoStateRaw";
import { map, switchMap, catchError } from "rxjs/operators";
import { MapistoTerritoryRaw } from "./MapistoTerritoryRaw";
import { Land } from "src/entities/Land";
import { LandRaw } from "./LandRaw";
import { yearToISOString } from "src/utils/date_utils";
import { ViewBoxLike } from "@svgdotjs/svg.js";
import { SceneRaw } from "./SceneRaw";
import { Scene } from "src/entities/Scene";
import { StateRepresentationRaw } from "./StateRepresentationRaw";
import { StateRepresentation } from "src/entities/StateRepresentation";
import { MapData } from "./MapData";
import { MapDataRaw } from "./MapDataRaw";
import { MapistoError } from "./MapistoError";

export class MapistoAPI {

    static loadMap(
        year: number,
        precisionLevel: number,
        bbox: ViewBoxLike
    ): Observable<MapData> {
        return from(
            axios.get<MapDataRaw>(`${config.api_path}/map`, {
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
            map(res => parseMapData(res.data, precisionLevel)),
        );
    }

    static loadGifMapForState(stateId: number, pixelWidth: number): Observable<MapData[]> {
        return ajax.getJSON<{ maps: MapDataRaw[] }>(`${config.api_path}/gif_map_for_state/${stateId}?pixel_width=${pixelWidth}`)
            .pipe(
                map(res => res.maps.map(mapRaw => parseMapData(mapRaw, pixelWidth))),
            );

    }

    static loadMapForState(stateId: number, year: number, pixelWidth: number)
        : Observable<MapData> {
        return ajax.getJSON<MapDataRaw>(`${config.api_path}/map_for_state/${stateId}?date=${yearToISOString(year)}&pixel_width=${pixelWidth}`)
            .pipe(
                map(res => parseMapData(res, pixelWidth)),
                catchError(e => {
                    console.warn(e);
                    return of({
                        states: [],
                        territories: [],
                        boundingBox: { x: 0, y: 0, width: 16, height: 9 },
                        date: new Date()
                    });
                })
            );
    }
    static loadMapForTerritory(territoryId: number, year: number, pixelWidth: number)
        : Observable<MapData> {
        return ajax.getJSON<MapDataRaw>(`${config.api_path}/map_for_territory/${territoryId}?date=${yearToISOString(year)}&pixel_width=${pixelWidth}`)
            .pipe(
                map(res => parseMapData(res, pixelWidth))
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

    static editTerritory(territory: MapistoTerritory): Observable<MapistoTerritory> {
        return from(
            axios.put<{ modified_territory: number }>(`${config.api_path}/territory`, territoryJSON(territory))
        ).pipe(
            switchMap(response => MapistoAPI.loadTerritory(response.data.modified_territory))
        );
    }
    static loadLands(
        precisionLevel: number,
        bbox: ViewBoxLike
    ): Observable<Land[]> {
        return from(
            axios.get<{ lands: LandRaw[] }>(`${config.api_path}/land`, {
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
            map(response => response.lands.map(raw => parseLand(raw, precisionLevel))),
        );
    }


    static mergeStates(stateId: number, sovereignStateId: number): Observable<number> {
        return from(
            axios.put<{ merged_into: number }>(`${config.api_path}/merge_state/${stateId}/into/${sovereignStateId}`)
        ).pipe(
            catchError(mapistoErrorHanlder),
            map(response => response.data.merged_into)
        );

    }

    static createState(toCreate: MapistoState): Observable<number> {
        return from(
            axios.post<{ added_state: number }>(`${config.api_path}/state`,
                stateJSON(toCreate)
            )).pipe(
                map(res => res.data.added_state)
            );
    }

    static putState(modifiedState: MapistoState, absorbConflicts = false): Observable<number> {
        return from(
            axios.put<{ modified_state: number }>(`${config.api_path}/state`,
                stateJSON(modifiedState),
                {
                    params: {
                        absorb_conflicts: absorbConflicts
                    }
                }
            )).pipe(
                catchError(e => throwError(e.response.data)),
                map(response => response.data.modified_state)
            );
    }


    static searchState(pattern: string): Observable<MapistoState[]> {
        return from(
            axios.get<{ search_results: MapistoStateRaw[] }>(`${config.api_path}/state_search`, {
                params: {
                    pattern,
                }
            })
        ).pipe(
            map(res => res.data.search_results.map(s => parseState(s)))
        );
    }

    static getVideo(stateId: number, pixelWidth: number, onProgress?: (progress: number) => void): Observable<Scene[]> {
        return from(
            axios.get<{ scenes: SceneRaw[] }>(`${config.api_path}/state/${stateId}/movie`, {
                params: {
                    pixel_width: pixelWidth
                },
                onDownloadProgress: onProgress ? event => onProgress(event.loaded / event.total) : undefined
            })
        ).pipe(
            map(res => res.data.scenes.map(s => parseScene(s))),
        );
    }
}

const mapistoErrorHanlder = (error: any) =>
    throwError({
        code: error.response.status,
        data: error.response.data.data,
        text: error.response.data.description
    } as MapistoError);



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
    const res = {
        bounding_box: from.boundingBox,
        representations: from.representations.map(r => stateRepresentationJSON(r)),
        state_id: from.stateId,
        validity_end: from.validityEnd.toISOString(),
        validity_start: from.validityStart.toISOString()
    };

    if (!res.validity_start.endsWith('T00:00:00.000Z')) {
        throw Error(`Error validity start ends with a specific time of the day : ${res.validity_start}`);
    }
    if (!res.validity_end.endsWith('T00:00:00.000Z')) {
        throw Error(`Error validity end ends with a specific time of the day : ${res.validity_end}`);
    }

    return res;
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
    const res = {
        color: from.color,
        name: from.name,
        validity_start: from.validityStart.toISOString(),
        validity_end: from.validityEnd.toISOString(),
    };
    if (!res.validity_start.endsWith('T00:00:00.000Z')) {
        throw Error(`Error validity start ends with a specific time of the day : ${res.validity_start}`);
    }
    if (!res.validity_end.endsWith('T00:00:00.000Z')) {
        throw Error(`Error validity end ends with a specific time of the day : ${res.validity_end}`);
    }
    return res;
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

function territoryJSON(from: MapistoTerritory): MapistoTerritoryRaw {
    return {
        bounding_box: from.boundingBox,
        color: from.color,
        d_path: from.dPath,
        name: from.name,
        validity_end: from.validityEnd.toISOString(),
        validity_start: from.validityStart.toISOString(),
        state_id: from.mpState.stateId,
        territory_id: from.territoryId
    };
}

function parseScene(raw: SceneRaw): Scene {
    const states = raw.states.map(s => parseState(s));
    return new Scene(
        new Date(raw.validity_start + "Z"),
        new Date(raw.validity_end + "Z"),
        raw.territories.map(t => parseTerritory(t, null, states.find(st => st.stateId === t.state_id))),
        raw.bounding_box,
        raw.lands.map(l => parseLand(l, undefined))
    );
}

function parseMapData(raw: MapDataRaw, precisionLevel: number): MapData {
    const mpStates = raw.states.map(r => parseState(r));

    const res: MapData = {
        territories: raw.territories.map(
            t => parseTerritory(t, precisionLevel, mpStates.find(s => s.stateId === t.state_id))
        ),
        boundingBox: raw.bounding_box,
        date: new Date(raw.date + 'Z')
    };
    for (const t of res.territories) {
        t.mpState.getName(t.validityStart);
    }

    return res;
}

