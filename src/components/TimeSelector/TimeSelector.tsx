import {Component, ChangeEvent} from 'react'
import React from 'react'
import store from '../../store/store';
import updateTime from '../../actions/actions'

import { connect } from 'react-redux'


interface Props{
    updateTime : Function
}
interface State{
    year : number
}
class TimeSelector extends Component<Props , State>{

    constructor(props:Props){
        super(props);
        this.state = {
            year : 1918
        }
    }

    changeYear(event : ChangeEvent<HTMLInputElement>){
        this.setState({
            year : parseInt(event.target.value)
        }, () => {
            this.props.updateTime(new Date(this.state.year+"-01-01"))
        })
    }
    render(){
        return (
            <input type="number" value={this.state.year} onChange={e => this.changeYear(e) }/>
        )
    }
}

export const TimeSelectorConnected =  connect(null, {updateTime})(TimeSelector)