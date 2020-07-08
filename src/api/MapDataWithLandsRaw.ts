import { MapDataRaw } from "./MapDataRaw";
import { LandRaw } from "./LandRaw";

export interface MapDataWithLandsRaw extends MapDataRaw{
    lands : LandRaw[];
}