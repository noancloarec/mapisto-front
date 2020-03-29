import { TimeNavigableSVGManager } from "../TimeNavigableMap/TimeNavigableSVGManager";
import { Subject } from "rxjs";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { G } from "@svgdotjs/svg.js";
import { Path, Shape } from "@svgdotjs/svg.js";
import { ViewBoxLike } from "@svgdotjs/svg.js";

export class InteractiveSVGManager extends TimeNavigableSVGManager {
    public territorySelection$: Subject<MapistoTerritory>;
    private clickWithoutPan: boolean;
    private selectedTerritory: MapistoTerritory;
    constructor() {
        super();
        this.territorySelection$ = new Subject<MapistoTerritory>();
        this.territorySelection$.subscribe(t => this.selectedTerritory = t);
    }

    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        super.initMap(svgParent, vb);
        this.attachClickWithoutPan(this.seaRect, () => {
            this.selectTerritory(null);
        });
    }

    protected addTerritoryToStateGroup(stateGroup: G, territory: MapistoTerritory): Path {
        const res = super.addTerritoryToStateGroup(stateGroup, territory);
        if (this.selectedTerritory && this.selectedTerritory.territoryId === territory.territoryId) {
            res.addClass('selected');
        }
        this.attachClickWithoutPan(res, () => {
            this.selectTerritory(territory);
            res.addClass('selected');
        });


        return res;
    }

    private selectTerritory(territory: MapistoTerritory) {
        this.selectedTerritory = territory;
        this.territorySelection$.next(territory);
        for (const elem of this.drawing.find('.selected')) {
            elem.removeClass('selected');
        }

    }

    private attachClickWithoutPan(target: Shape, fn: () => void) {
        target.on('mousedown', () => { this.clickWithoutPan = true; });
        target.on('mousemove', () => { this.clickWithoutPan = false; });
        target.on('mouseup', () => {
            if (this.clickWithoutPan) {
                fn();
            }
        });

    }
}