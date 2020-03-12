import { Component } from 'react'
import React from 'react'
import { updateTime } from '../../store/actions'

import './TimeSelector.css'
import { connect } from 'react-redux'


interface Props {
    updateTime: Function
}
interface State {
    year: number
}
class TimeSelector extends Component<Props, State>{

    targetForArrowNavigation: HTMLElement

    constructor(props: Props) {
        super(props);
        this.state = {
            year: 1918
        }
    }

    /**
     * Listen for arrow navigation on the world map
     */
    componentDidMount() {
        this.targetForArrowNavigation = document.querySelector('#world-map');
        this.targetForArrowNavigation.setAttribute("tabindex", "0");
        this.targetForArrowNavigation.addEventListener('keydown', (e) => this.handleKeyDown(e))
    }
    componentWillUnmount() {
        this.targetForArrowNavigation.removeEventListener('keydown', (e) => this.handleKeyDown(e))
    }

    /**
     * Increment or decrement the year on arrow left/right
     * @param event 
     */
    handleKeyDown(event: KeyboardEvent) {
        if (event.key === "ArrowLeft") {
            this.changeYear(this.state.year - 1)
        } else if (event.key === "ArrowRight") {
            this.changeYear(this.state.year + 1)
        }
    }


    changeYear(year: number) {
        const equivalentDate = new Date(new Date("0000-01-01Z").setFullYear(year))
        this.setState({
            year: year
        }, () => {
            this.props.updateTime(equivalentDate)
        })
    }
    render() {
        return (
            <div >
                <span onClick={e => this.changeYear(this.state.year - 1)}>&#9664;</span>
                <input className="time-select" type="number" value={this.state.year} onChange={e => this.changeYear(parseInt(e.target.value))} />
                <span onClick={e => this.changeYear(this.state.year + 1)}>&#9654;</span>
            </div>
        )
    }
}


export const TimeSelectorConnected = connect(null, { updateTime })(TimeSelector)