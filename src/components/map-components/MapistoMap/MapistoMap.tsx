import { SVGManager } from "./SVGManager";
import { MapistoState } from "src/entities/mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
import '@svgdotjs/svg.panzoom.js';
import React, { RefObject } from "react";
import './MapistoMap.css';
import { Land } from "src/entities/Land";

interface Props {
    SVGManager: SVGManager;
    mpStates: MapistoState[];
    lands: Land[];
    initialViewbox: ViewBoxLike;
    onKeyDown?: (event: React.KeyboardEvent) => void;
    // onViewBoxChange?: (viewbox: ViewBoxLike, precision: number) => void;
}
export class MapistoMap extends React.Component<Props, {}>{
    public static defaultProps = {
        // tslint:disable-next-line: object-literal-shorthand
        SVGManager: new SVGManager(),
    };

    /**
     * A reference to the parent of the SVG. To be given to mapDomManager so it can create the SVG map
     */
    private containerRef: RefObject<HTMLDivElement>;


    constructor(props: Props) {
        super(props);
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
        console.log({ nextProps, props: this.props });
        for (const [key, value] of Object.entries(nextPropsWithoutMapData)) {
            for (const [keyb, valueb] of Object.entries(nextPropsWithoutMapData)) {
                if (key === keyb && value !== valueb) {
                    console.log("difference between ", value, valueb);
                    return true;
                }
            }
        }

        if (nextProps.mpStates !== this.props.mpStates) {
            this.drawTerritories(nextProps.mpStates);
        } else {
            console.log("no difference in territories");

        }
        if (nextProps.lands !== this.props.lands) {
            this.drawLand(nextProps.lands);
        }
        return false;
    }
    componentDidMount() {
        this.initSVG();
    }

    componentDidUpdate() {
        this.initSVG();
    }

    private drawTerritories(mpStates: MapistoState[]) {
        this.props.SVGManager.clearTerritories();
        for (const mpState of mpStates) {
            this.props.SVGManager.addState(mpState);
        }
    }

    private drawLand(lands: Land[]) {
        this.props.SVGManager.clearLands();
        lands.forEach(land => this.props.SVGManager.addLand(land));
    }

    // private handleViewBoxChange(vb: ViewBoxLike) {
    //     const precision = this.getCurrentPrecision();
    //     if (this.props.onViewBoxChange) {
    //         this.props.onViewBoxChange(vb, precision);
    //     }
    // }



    private initSVG() {
        this.props.SVGManager.initMap(
            this.containerRef.current, this.props.initialViewbox /*, vb => this.handleViewBoxChange(vb) */
        );
        this.drawTerritories(this.props.mpStates);
        this.drawLand(this.props.lands);
    }



    render() {
        console.log("MAP render");
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