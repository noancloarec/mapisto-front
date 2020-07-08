import { MapData } from "./MapData";
import { Land } from "src/entities/Land";

export interface MapDataWithLands extends MapData{
    lands : Land[];
}