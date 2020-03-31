import { FocusedSVGManager } from "../FocusedOnStateMap/FocusedSVGManager";
import { G, Path, Circle } from "@svgdotjs/svg.js";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { svgCoords } from "../MapistoMap/display-utilities";

export class SelectCapitalSVGManager extends FocusedSVGManager {
    private targetTerritoryId: number;
    public onSelectCapital: (capital: DOMPoint) => void;
    private capitalCircle: Circle;
    setTargetedTerritory(territory: MapistoTerritory) {
        this.targetTerritoryId = territory.territoryId;
    }

    protected addTerritoryToStateGroup(stateGroup: G, territory: MapistoTerritory): Path {
        const t = super.addTerritoryToStateGroup(stateGroup, territory);
        if (territory.territoryId === this.targetTerritoryId) {
            t.click((e: MouseEvent) => {
                const coords = svgCoords(e.clientX, e.clientY, this.parentElement);
                this.drawCapitalCircle(coords.x, coords.y);
                this.onSelectCapital(coords);
            });
        }
        return t;
    }
    private drawCapitalCircle(x: number, y: number) {
        if (this.capitalCircle) {
            this.capitalCircle.remove();
        }
        const diameter = this.pointsPerPixel() * 10;
        this.capitalCircle = this.drawing.circle(diameter).move(x - diameter / 2, y - diameter / 2);
    }
}