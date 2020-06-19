import { SVGManager } from "../MapistoMap/SVGManager";
import { G, ViewBoxLike, Rect } from '@svgdotjs/svg.js';
import { MapistoState } from "src/entities/mapistoState";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { auditTime } from "rxjs/operators";
import { getOverlayColor } from "src/utils/color_harmony";


export class FocusedSVGManager extends SVGManager {
    private focusedTerritoriesContainer: G;
    private focusedTerritoriesId: number[] = [];
    private focusedNamesContainer: G;
    private focusedViewbox: ViewBoxLike;
    private overlayRect: Rect;
    constructor() {
        super();
        this.scheduleNameRefresh$.pipe(
            auditTime(300)
        ).subscribe(
            () => this.refreshNamesDisplay(this.focusedNamesContainer, this.focusedTerritoriesContainer)
        );
    }

    setFocusedTerritories(territories: MapistoTerritory[]) {
        this.focusedTerritoriesContainer.clear();
        this.focusedTerritoriesId = territories.map(t => t.territoryId);
    }

    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        super.initMap(svgParent, vb);
        this.overlayRect = this.drawing.rect(1e5, 1e5).move(-5e4, -5e4).id('overlay');
        this.focusedTerritoriesContainer = this.drawing.group().id('focused-territories');
        this.focusedNamesContainer = this.drawing.group().id('focused-names-container');
        if (this.focusedViewbox) {
            this.drawing.viewbox(this.focusedViewbox);
        }
    }

    addState(st: MapistoState) {
        super.addState(st);
        // const territoriesToFocusOn = st.territories.filter(
        //     t => this.focusedTerritoriesId.indexOf(t.territoryId) !== -1
        // );
        // if (territoriesToFocusOn.length) {
        //     const stateGroup = this.addStateGroup(st.stateId, st.name, st.color, this.focusedTerritoriesContainer);
        //     for (const territory of territoriesToFocusOn) {
        //         this.addTerritoryToStateGroup(stateGroup, territory);
        //     }
        //     this.overlayRect.fill(getOverlayColor(st.color));
        // }
    }



}