import React from 'react';
import './LoadingIcon.css';
interface Props {
    loading: boolean;
}
export class LoadingIcon extends React.Component<Props, {}> {
    render() {
        return (
            <div className={this.props.loading ? "lds-ring" : ""}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        );
    }
}