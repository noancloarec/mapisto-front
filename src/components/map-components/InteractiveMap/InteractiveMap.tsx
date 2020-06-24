import React from 'react';
import { TimeNavigableMap } from '../TimeNavigableMap/TimeNavigableMap';
import { InteractiveSVGManager } from './InteractiveSVGManager';
import './InteractiveMap.css';
import { connect } from 'react-redux';
import { changeYear } from 'src/store/main-map/actions';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { selectTerritory, fitSelectedToYear } from 'src/store/edition/actions';
import { EditionActionTypes } from 'src/store/edition/types';
import { MainMapActionTypes } from 'src/store/main-map/types';
import { withRouter, RouteComponentProps } from 'react-router';
import { ViewBoxLike } from '@svgdotjs/svg.js';


interface DispatchProps {
    yearChange: (newYear: number) => void;
    onSelectTerritory: (t: MapistoTerritory) => void;
}
type Props = DispatchProps & RouteComponentProps;
export class InteractiveMap extends React.Component<Props, {}>{
    private svgManager: InteractiveSVGManager;
    constructor(props: Props) {
        super(props);
        this.svgManager = new InteractiveSVGManager();
        this.svgManager.territorySelection$.subscribe(t => this.props.onSelectTerritory(t));
    }
    render() {
        return (
            <div className="interactive-map">
                <div className="main-state-search p-2 d-flex justify-content-end">
                    <div className="col-12 col-sm-4 mt-5 mt-sm-1">

                    </div>
                </div>
            </div >
        );
    }
    componentDidMount() {
        this.props.onSelectTerritory(null);
    }
    yearFromParams() {
        let year = parseInt(new URLSearchParams(this.props.location.search).get('year'), 10)
        if (!year) {
            year = Math.floor(Math.random() * 300 + 1700);
            this.updateParams(year);
        }
        console.log('got year from params : ', year)
        this.props.yearChange(year);
        return year;
    }

    updateParams(year: number) {
        const searchParams = new URLSearchParams(this.props.location.search);
        searchParams.set('year', `${year}`);
        this.props.history.push({
            pathname: '/',
            search: searchParams.toString()
        });
    }

    vbFromParams(): ViewBoxLike {
        const params = new URLSearchParams(this.props.location.search);
        const x = parseInt(params.get('x'), 10);
        const y = parseInt(params.get('y'), 10);
        const width = parseInt(params.get('width'), 10);
        const height = parseInt(params.get('height'), 10);
        if (!(isNaN(x) || isNaN(y) || isNaN(width) || isNaN(height))) {
            return {
                x, y, width, height
            };
        } else {
            return { x: 0, y: 0, width: 1000, height: 1000 };
        }
    }
}


const mapDispatchToProps = (
    dispatch: (action: EditionActionTypes | MainMapActionTypes) => void
): DispatchProps => ({
    yearChange: year => {
        dispatch(changeYear(year));
        dispatch(fitSelectedToYear(year));
    },
    onSelectTerritory: territory => dispatch(selectTerritory(territory))
});




export const InteractiveMapConnected = withRouter(connect(() => ({}), mapDispatchToProps)(InteractiveMap));