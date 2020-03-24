import { SVGManager } from "./SVGManager";
import { MapistoState } from "src/interfaces/mapistoState";
import { SVG, ViewBoxLike } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import React, { RefObject } from "react";

interface Props {
    SVGManager: SVGManager;
    mpStates: MapistoState[];
    viewbox: ViewBoxLike;
}
export class MapistoMap extends React.Component<Props, {}>{
    public static defaultProps = {
        SVGManager: new SVGManager()
    };

    /**
     * A reference to the parent of the SVG. To be given to mapDomManager so it can create the SVG map
     */
    containerRef: RefObject<HTMLDivElement>;

    constructor(props: Props) {
        super(props);
        this.containerRef = React.createRef<HTMLDivElement>();
    }

    componentDidMount() {
        // Coordinates of the map are hard-coded. They represents the bounds of the map on the server
        this.props.SVGManager.initMap(
            this.containerRef.current, this.props.viewbox
        );
        if (this.props.mpStates) {
            for (const mpState of this.props.mpStates) {
                this.props.SVGManager.addState(mpState);
            }
        }
    }

    render() {
        return (
            <div>
                <p>COUCOU</p>
                <div className="map" ref={this.containerRef}>
                </div>
            </div>
        );
    }

}