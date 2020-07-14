import React, { CSSProperties } from 'react';
import './LoadingIcon.css';
interface Props {
    loading: boolean;
    thickness: string;
    color: string;
    size: number;
}
export class LoadingIcon extends React.Component<Props, {}> {
    public static defaultProps = {
        thickness: '8px',
        color: '#437ff9',
        size: 64
    };
    render() {
        const cssProps: CSSProperties = {
            borderWidth: this.props.thickness,
            borderColor: this.props.color + ' transparent transparent transparent'
        };
        return (
            <div className={"loading-container "}>
                <div className={this.props.loading ? "lds-ring" : ""}
                    style={{ width: this.props.size, height: this.props.size }}
                >
                    <div style={cssProps}></div>
                    <div style={cssProps}></div>
                    <div style={cssProps}></div>
                    <div style={cssProps}></div>
                </div>
            </div>
        );
    }
}