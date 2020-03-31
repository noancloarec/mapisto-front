import { NavigableSVGManager } from "../NavigableMap/NavigableSVGManager";

export class TimeNavigableSVGManager extends NavigableSVGManager {
    attachOnKeyDown(fn: (event: KeyboardEvent) => void) {
        this.parentElement.setAttribute("tabindex", "0");
        this.drawing.click(() => this.parentElement.focus())
        this.parentElement.addEventListener('keydown',
            fn
        );
    }
}