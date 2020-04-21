import { SVGManager } from "./SVGManager";
import { MapistoState } from "src/entities/mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import React, { RefObject } from "react";
import './MapistoMap.css';
import { Land } from "src/entities/Land";

interface Props {
    SVGManager?: SVGManager;
    mpStates: MapistoState[];
    lands: Land[];
    viewbox: ViewBoxLike;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    // onViewBoxChange?: (viewbox: ViewBoxLike, precision: number) => void;
}
export class MapistoMap extends React.Component<Props, {}>{


    /**
     * A reference to the parent of the SVG. To be given to mapDomManager so it can create the SVG map
     */
    private containerRef: RefObject<HTMLDivElement>;


    private svgManager: SVGManager;
    constructor(props: Props) {
        super(props);
        if (this.props.SVGManager) {
            this.svgManager = this.props.SVGManager;
        } else {
            this.svgManager = new SVGManager();
        }
        this.containerRef = React.createRef<HTMLDivElement>();
    }



    shouldComponentUpdate(nextProps: Props) {
        const nextPropsWithoutMapData = { ...nextProps };
        const propsWithoutMapData = { ...this.props };
        delete nextPropsWithoutMapData.mpStates;
        delete propsWithoutMapData.mpStates;
        delete nextPropsWithoutMapData.lands;
        delete propsWithoutMapData.lands;
        // console.log(this.props.onViewBoxChange)
        // console.log(nextProps.onViewBoxChange)
        for (const [key, value] of Object.entries(nextPropsWithoutMapData)) {
            for (const [keyb, valueb] of Object.entries(nextPropsWithoutMapData)) {
                if (key === keyb && value !== valueb) {
                    console.warn("difference between ", value, valueb);
                    return true;
                }
            }
        }

        if (nextProps.mpStates !== this.props.mpStates) {
            this.drawTerritories(nextProps.mpStates);
        }
        if (nextProps.lands !== this.props.lands) {
            this.drawLand(nextProps.lands);
        }
        if (nextProps.viewbox !== this.props.viewbox) {
            this.svgManager.setViewbox(nextProps.viewbox);
        }
        return false;
    }
    componentDidMount() {
        this.initSVG();
    }

    componentDidUpdate() {
        this.initSVG();
    }

    componentWillUnmount() {
        console.log("map unmount");
        this.svgManager.onUnmount();
        delete this.svgManager;
    }
    private drawTerritories(mpStates: MapistoState[]) {
        this.svgManager.clearTerritories();
        for (const mpState of mpStates) {
            this.svgManager.addState(mpState);
        }
    }

    private drawLand(lands: Land[]) {
        this.svgManager.clearLands();
        lands.forEach(land => this.svgManager.addLand(land));
    }

    // private handleViewBoxChange(vb: ViewBoxLike) {
    //     const precision = this.getCurrentPrecision();
    //     if (this.props.onViewBoxChange) {
    //         this.props.onViewBoxChange(vb, precision);
    //     }
    // }



    private initSVG() {
        this.svgManager.initMap(
            this.containerRef.current, this.props.viewbox /*, vb => this.handleViewBoxChange(vb) */
        );
        this.drawTerritories(this.props.mpStates);
        this.drawLand(this.props.lands);
    }



    render() {
        return (
            <div className="map"
                onKeyDown={event => {
                    // console.log(this.props.onKeyDown)
                    // this.props.onKeyDown && this.props.onKeyDown(event)
                }}
                ref={this.containerRef}>
            </div>
        );
    }

}