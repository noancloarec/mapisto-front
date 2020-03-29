import { SVGManager } from "../MapistoMap/SVGManager";
import { G, ViewBoxLike } from '@svgdotjs/svg.js';
import { MapistoState } from "src/entities/mapistoState";
import { MapistoTerritory } from "src/entities/mapistoTerritory";
import { auditTime } from "rxjs/operators";


export class FocusedSVGManager extends SVGManager {
    private focusedTerritoriesContainer: G;
    private focusedTerritoriesId: number[] = [];
    private focusedNamesContainer: G;
    private focusedViewbox: ViewBoxLike;

    constructor() {
        super();
        this.scheduleNameRefresh$.pipe(
            auditTime(300)
        ).subscribe(
            () => this.refreshNamesDisplay(this.focusedNamesContainer, this.focusedTerritoriesContainer)
        );
    }

    setFocusedTerritories(territories: MapistoTerritory[]) {
        this.focusedTerritoriesId = territories.map(t => t.territoryId);
    }

    initMap(svgParent: HTMLDivElement, vb: ViewBoxLike) {
        super.initMap(svgParent, vb);
        this.drawing.rect(1e5, 1e5).move(-5e4, -5e4).id('black-overlay');
        this.focusedTerritoriesContainer = this.drawing.group().id('focused-territories');
        this.focusedNamesContainer = this.drawing.group().id('focused-names-container');
        if (this.focusedViewbox) {
            this.drawing.viewbox(this.focusedViewbox);
        }
    }

    focusViewbox(vb: ViewBoxLike, minAspectRatio: number): ViewBoxLike {
        this.focusedViewbox = this.enlargeViewBox(this.fitViewboxToAspectRatio(vb, minAspectRatio));
        if (this.drawing) {
            this.drawing.viewbox(this.focusedViewbox);
        }
        return this.focusedViewbox;
    }



    addState(st: MapistoState) {
        super.addState(st);
        const territoriesToFocusOn = st.territories.filter(
            t => this.focusedTerritoriesId.indexOf(t.territoryId) !== -1
        );
        if (territoriesToFocusOn.length) {
            const stateGroup = this.addStateGroup(st.stateId, st.name, st.color, this.focusedTerritoriesContainer);
            for (const territory of territoriesToFocusOn) {
                this.addTerritoryToStateGroup(stateGroup, territory);
            }
        }
    }

    private enlargeViewBox(vb: ViewBoxLike): ViewBoxLike {
        const resizeFactor = .2;
        return {
            x: vb.x - resizeFactor * vb.width / 2,
            y: vb.y - resizeFactor * vb.height / 2,
            width: vb.width * (1 + resizeFactor),
            height: vb.height * (1 + resizeFactor)
        };
    }

    private fitViewboxToAspectRatio(vb: ViewBoxLike, minAspectRatio: number): ViewBoxLike {
        const aspect = vb.width / vb.height;
        if (aspect < minAspectRatio) {
            return {
                ...vb,
                width: minAspectRatio * vb.height,
                x: vb.x - (minAspectRatio * vb.height - vb.width) / 2
            };
        } else {
            return vb;
        }
    }


}