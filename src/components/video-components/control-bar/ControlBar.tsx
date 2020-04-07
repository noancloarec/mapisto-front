import React, { RefObject } from 'react';
import './ControlBar.css';

interface Props {
    year: number;
    paused: boolean;
    start:number;
    end:number;
    onPause: () => void;
    onYearChange: (newYear: number) => void;
}
interface State{
    progressBeingChanged : boolean;
}
export class ControlBar extends React.Component<Props, State>{
    private progressBarRef : RefObject<HTMLDivElement>;
    constructor(props : Props){
        super(props);
        this.progressBarRef = React.createRef();

        this.state = {
            progressBeingChanged : false
        };
    }


    render() {
        return (
            <div className="control-bar">
                <div className="bg-gradient">

                </div>
                <div className="progress-bar-container"
                ref={this.progressBarRef}
                 onMouseDown={e=> this.handleMouseDown(e)}>
                    <div className="progress-bar">
                        <div className="accomplished-progress" style={({width : `${this.computeProgress()}%`})}></div>
                    </div>
                </div>
                <div className="play-pause-button" onClick={this.props.onPause}>
                    {
                        this.props.paused?
                        (
                            <svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
                                <path
                                    className="play-button"
                                    d="M
                                    12,26
                                    25,18
                                    12,10 z">
                                </path>
                            </svg>

                        ):
                        (
                            <svg height="100%" version="1.1" viewBox="0 0 36 36" >
                                <path  d="M 12,26 16,26 16,10 12,10 z M 21,26 25,26 25,10 21,10 z"></path>
                            </svg>
                        )
                    }
                </div>
            </div>
        );
    }

    computeProgress():number{
        const totalYears = this.props.end - this.props.start;
        const elapsedYears = this.props.year - this.props.start;
        return Math.ceil(100*elapsedYears/totalYears);
    }

    componentDidMount(){
        window.addEventListener('mousemove', e => this.handleMouseMove(e));
        window.addEventListener('mouseup', e => this.handleMouseUp(e));
    }
    componentWillUnmount(){
        window.removeEventListener('mousemove', e => this.handleMouseMove(e));
        window.removeEventListener('mouseup', e => this.handleMouseUp(e));
    }

    handleMouseMove(event : MouseEvent){
        if(this.state.progressBeingChanged){
            this.emitYearChange(event);
        }
    }

    handleMouseUp(event : MouseEvent){
        this.setState({
            progressBeingChanged : false
        });
    }

    emitYearChange(event: MouseEvent){
        const boundingRect = this.progressBarRef.current.getBoundingClientRect();
        const progress = (event.clientX - boundingRect.left)/boundingRect.width;
        const year = Math.floor((this.props.end - this.props.start)*progress + this.props.start);
        this.props.onYearChange(year);

    }

    handleMouseDown(event : React.MouseEvent<HTMLDivElement, MouseEvent>){
        this.setState({
            progressBeingChanged : true
        });
        if(!this.props.paused){
            this.props.onPause();
        }
        this.emitYearChange(event.nativeEvent)
    }
}