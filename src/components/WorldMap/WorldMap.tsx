import React, { MouseEvent } from "react";
import axios from 'axios'
import { config } from '../../config';
import { MapistoState } from "../../models/mapistoState";
import './WorldMap.css'
import { ViewBox } from "../../models/viewbox";
import SVG from 'svg.js';
import store from '../../store/store'
import { connect } from "react-redux";

interface State {
}

interface Props {
    year: number
}

const scrollSpeed = 2;

class WorldMap extends React.Component<Props, State>{
    drawing: SVG.Doc
    dragStartPoint: DOMPoint
    dragging: boolean = false;

    constructor(props: Props) {
        super(props)
    }

    componentDidMount() {
        this.drawing = SVG('map').viewbox(0, 0, 2269.4568, 1550.3625);
        this.drawing.native().setAttribute("preserveAspectRatio", "xMinYMin slice");
        this.loadLand();
    }
    shouldComponentUpdate(newProps: Props) {
        if (newProps.year !== this.props.year) {
            this.updateTime(newProps.year)
        }
        return false;
    }

    async loadLand() {
        const res = await axios.get<string[]>(`${config.api_path}/land`);
        const land_container = this.drawing.group().id('land-mass');
        for (const d_path of res.data) {
            land_container.path(d_path)
        }

        this.updateTime(this.props.year)

    }

    async updateTime(year: number) {
        const res = await axios.get<MapistoState[]>(`${config.api_path}/state`, {
            params: {
                date: year + "-01-01"
            }
        })
        this.drawing.select('.state').each((_, members) => {
            for (let member of members) {
                member.remove()
            }
        })

        for (const mapistoState of res.data) {
            this.addToMap(mapistoState.territories, mapistoState.state_id, '#' + mapistoState.color)
        }
    }

    addToMap(paths: string[], state_id: number, color: string) {
        let group = this.drawing.group().id("" + state_id)
        group.fill(color).stroke(color).attr('class', 'state');
        for (let i = 0; i < paths.length; i++) {
            group.path(paths[i])
        }
        group.native().addEventListener("click", () => {
            this.selectState(state_id)
        })
    }

    selectState(id : number){
        alert('selected text with id'+id)
    }

    startDragging(event: MouseEvent) {
        this.dragStartPoint = this.svgCoords(event);
        this.dragging = true
    }

    endDragging() {
        this.dragging = false;
    }

    handleZoom(event: React.WheelEvent<HTMLElement>) {
        const minSideSize = 10; // the maps viewbox width or height cannot be inferior to 10 points

        const parentDiv: HTMLElement = this.drawing.native().parentElement;
        const vb = this.drawing.viewbox();

        const drawWidth = parentDiv.clientWidth;
        const drawHeight = parentDiv.clientHeight;

        const xCoord = event.clientX - parentDiv.offsetLeft
        const yCoord = event.clientY - parentDiv.offsetTop
        const minSide = Math.min(vb.width, vb.height)
        const dw = drawWidth * -event.deltaY * scrollSpeed * minSide / 1e6;
        const dh = drawHeight * -event.deltaY * scrollSpeed * minSide / 1e6;
        const dx = dw * xCoord / drawWidth
        const dy = dh * yCoord / drawHeight
        if (vb.width - dw >= minSideSize && vb.height - dh >= minSideSize) {

            this.drawing.viewbox(
                vb.x + dx,
                vb.y + dy,
                vb.width - dw,
                vb.height - dh
            )
        } else {
            console.log('zoom was forbidden')
        }
    }

    svgCoords(event: MouseEvent): DOMPoint {
        let pt = new DOMPoint(event.clientX, event.clientY);
        return pt.matrixTransform(document.querySelector('svg').getScreenCTM().inverse())
    }

    handleDrag(event: MouseEvent) {
        if (!this.dragging) {
            return
        }
        let targetPoint = this.svgCoords(event);
        this.shiftViewBox(this.dragStartPoint.x - targetPoint.x,
            this.dragStartPoint.y - targetPoint.y);
    }


    shiftViewBox(deltaX: number, deltaY: number) {
        const viewbox = this.drawing.viewbox()
        this.drawing.viewbox(viewbox.x + deltaX, viewbox.y + deltaY, viewbox.width, viewbox.height)
    }


    render() {
        console.log('MAP RENDERING')
        return (
            <div id="map"
                onWheel={event => this.handleZoom(event)}
                onMouseDown={event => this.startDragging(event)}
                onMouseUp={() => this.endDragging()}
                onMouseLeave={() => this.endDragging()}
                onMouseMove={(event) => this.handleDrag(event)}
            >
            </div>
        )
    }
}

const mapStateToProps = (state: { current_date: Date }): Props => ({
    year: state.current_date.getFullYear()
});

export const WorldMapConnected = connect(mapStateToProps)(WorldMap)