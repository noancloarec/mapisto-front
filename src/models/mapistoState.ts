import { MapistoTerritory } from "./mapistoTerritory";

export interface MapistoState{
    state_id: number ;
    name: string ;
    territories: MapistoTerritory[] ;
    color: string;
}