import React from 'react';
import { TimeNavigableMap } from 'src/components/map-components/TimeNavigableMap/TimeNavigableMap';
import { TerritoryPanel } from 'src/components/TerritoryPanel/TerritoryPanel';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { RouteComponentProps, withRouter } from 'react-router';
interface State {
    selectedTerritory: MapistoTerritory;
    year: number;
}
type Props = RouteComponentProps;
class HomePageUnrouted extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            selectedTerritory: undefined,
            year: this.yearFromParams()
        }
            ;
    }
    render() {
        return (
            <div>
                <section id="main-map">
                    <TimeNavigableMap
                        initialYear={this.state.year}
                        initialCenter={this.centerFromParams()}
                        initialWidth={this.widthFromParams()}
                        onTerritoryClicked={t => this.setState({ selectedTerritory: t })}
                        onYearChange={year => this.updateParams(year)}
                    />
                </section>
                <section id="territory-panel-section">
                    <TerritoryPanel
                        selectedTerritory={this.state.selectedTerritory}
                        year={this.state.year}
                        onClosePanel={() => this.setState({ selectedTerritory: undefined })}
                    />
                </section>
            </div>

        );
    }

    centerFromParams() {
        const centerX = +new URLSearchParams(this.props.location.search).get('center_x');
        const centerY = +new URLSearchParams(this.props.location.search).get('center_y');
        if (centerY && centerX) {
            return {
                x: centerX,
                y: centerY
            };
        } else {
            return {
                x: 1000,
                y: 300
            };
        }
    }

    widthFromParams(): number {
        const width = +new URLSearchParams(this.props.location.search).get('width');
        return width ? width : 1000;
    }

    yearFromParams() {
        let year = parseInt(new URLSearchParams(this.props.location.search).get('year'), 10);
        if (!year) {
            year = +localStorage.getItem('year_on_main_map');
            if (!year) {
                year = Math.floor(Math.random() * 300 + 1700);
            }
            this.updateParams(year);
        }
        return year;
    }

    private updateParams(year: number) {
        const searchParams = new URLSearchParams(this.props.location.search);
        searchParams.set('year', `${year}`);
        localStorage.setItem('year_on_main_map', '' + year);
        this.props.history.push({
            pathname: '/',
            search: searchParams.toString()
        });
    }


}

export const HomePage = withRouter(HomePageUnrouted);
