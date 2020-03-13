import { Component } from 'react'
import React from 'react'
import { updateTime } from '../../store/actions'

import './TimeSelector.css'
import { connect } from 'react-redux'
import { Subject } from 'rxjs'
import { debounceTime } from 'rxjs/operators'


interface Props {
    updateTime: (newTime : Date) => void
}
interface State {
    year: number
}
class TimeSelector extends Component<Props, State>{

    targetForArrowNavigation: HTMLElement
    change$: Subject<void>

    constructor(props: Props) {
        super(props);
        this.state = {
            year: 1918
        }
        this.change$ = new Subject<void>();
        this.change$.pipe(
            debounceTime(100)
        ).subscribe(
            () => this.props.updateTime(this.dateFromYear(this.state.year))
        )
    }

    /**
     * Listen for arrow navigation on the world map
     */
    // componentDidMount() {
    //     this.targetForArrowNavigation = document.querySelector('#world-map');
    //     this.targetForArrowNavigation.setAttribute("tabindex", "0");
    //     this.targetForArrowNavigation.addEventListener('keydown', (e) => this.handleKeyDown(e))
    // }
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
        this.setState({
            year: year
        }, () => {
            this.change$.next()
        })
    }

    private dateFromYear(year: number): Date {
        return new Date(new Date("0000-01-01Z").setFullYear(year))

    }
    render() {
        return (
            <div className="time-select">
                <span onClick={e => this.changeYear(this.state.year - 1)}>&#9664;</span>
                <input type="number" value={this.state.year} onChange={e => this.changeYear(parseInt(e.target.value))} />
                <span onClick={e => this.changeYear(this.state.year + 1)}>&#9654;</span>
            </div>
        )
    }
}


export const TimeSelectorConnected = connect(null, { updateTime })(TimeSelector)