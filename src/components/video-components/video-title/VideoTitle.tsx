import './VideoTitle.css';
import React from 'react';
interface Props {
    title: string;
    hidden: boolean;
}
export const VideoTitle: React.FunctionComponent<Props> = (props: Props) => {
    return (
        <div className={"video-title" + (props.hidden ? ' hidden' : '')}>
            <div className="bg-gradient-title">

            </div>
            <h1 >
                {props.title}
            </h1>
        </div>
    );
};