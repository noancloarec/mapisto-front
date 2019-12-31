import React from 'react'
import './LoadingIcon.css'
export class LoadingIcon extends React.Component {
    render() {
        return (
            <div className="lds-ring">
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        )
    }
}