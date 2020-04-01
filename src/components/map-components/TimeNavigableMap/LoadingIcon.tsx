import React from 'react';
import './LoadingIcon.css';
interface Props {
    loading: boolean;
    thickness: string;
}
export class LoadingIcon extends React.Component<Props, {}> {
    public static defaultProps = {
        thickness: '8px'
    };
    render() {
        return (
            <div className={this.props.loading ? "lds-ring" : ""}>
                <div style={({ borderWidth: this.props.thickness })}></div>
                <div style={({ borderWidth: this.props.thickness })}></div>
                <div style={({ borderWidth: this.props.thickness })}></div>
                <div style={({ borderWidth: this.props.thickness })}></div>
            </div>
        );
    }
}