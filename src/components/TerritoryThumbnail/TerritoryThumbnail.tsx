import { Component, RefObject } from "react";
import { MapistoTerritory } from "src/interfaces/mapistoTerritory";
import React from "react";
import SVG from 'svg.js';
import './TerritoryThumbnail.css';
interface Props{
    territory : MapistoTerritory;
    color : string;
}
export class TerritoryThumbnail extends Component<Props, {}>{
    svgContainer : RefObject<HTMLDivElement>;
    drawing : SVG.Doc;
    constructor(props: Props){
        super(props);
        this.svgContainer = React.createRef<HTMLDivElement>();
    }

    componentDidMount(){
        this.drawing = SVG(this.svgContainer.current);
        this.drawing.native().setAttribute("preserveAspectRatio", "xMidYMid");
        this.refreshSVG(this.props);
    }

    shouldComponentUpdate(newProps : Props){
        this.refreshSVG(newProps);
        return false;
    }
    private refreshSVG(newProps : Props){
        this.drawing.clear();
        const territoryPath = this.drawing.path(newProps.territory.d_path).fill(newProps.color);
        const bbox = territoryPath.bbox();
        this.drawing.viewbox(bbox);
    }
    render(){
        return <div className="territory-thumbnail-div" ref={this.svgContainer}>
        </div>;
    }
}