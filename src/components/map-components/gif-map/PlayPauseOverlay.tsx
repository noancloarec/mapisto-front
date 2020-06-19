import React from 'react';
import './PlayPauseOverlay.css';
import { PlayCircleOutlined, PauseCircleOutlined } from '@ant-design/icons';
interface Props {
    playing: boolean;
    onChange: () => void;
}
export const PlayPauseOverlay: React.FC<Props> = (props: Props) => {
    const iconStyle = { fontSize: '8em', color: 'white', cursor: 'pointer' }
    return (
        <div className={`play-pause-overlay d-flex justify-content-center flex-column ${props.playing ? '' : 'paused'}`}>
            <div className="d-flex justify-content-center">
                {
                    props.playing ?
                        <PauseCircleOutlined style={iconStyle} className="pause-icon" onClick={props.onChange} />
                        :
                        <PlayCircleOutlined style={iconStyle} onClick={props.onChange} />
                }
            </div>
        </div>
    );
};