import React from 'react'
import './LoadingIcon.css'
import { RootState } from '../../store/reducer';
import { connect } from 'react-redux';
interface Props {
    loading: boolean
}
class LoadingIcon extends React.Component<Props, {}> {
    render() {
        return (
            <div className={this.props.loading ? "lds-ring" : ""}>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
            </div>
        )
    }
}

/**
 * Maps the redux state to the props of the loading Icon
 * @param state The redux state
 */
const mapStateToProps = (state: RootState): Props => ({
    loading: state.lands_loading || state.territories_loading
});

export const LoadingIconConnected = connect(mapStateToProps)(LoadingIcon)