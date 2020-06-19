import React from 'react';
import { TimeNavigableMap } from 'src/components/map-components/TimeNavigableMap/TimeNavigableMap';
import { TerritoryPanel } from 'src/components/edition-components/TerritoryPanel/TerritoryPanel';
import { EditionPopupConnected } from 'src/components/edition-components/EditionPopup/EditionPopup';
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
                        initialCenter={{ x: 1000, y: 300 }}
                        initialWidth={1000}
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
                <section id="editing-panel-section">
                    <EditionPopupConnected />
                </section>
                <section>

                </section>
            </div>

        );
    }

    yearFromParams() {
        let year = parseInt(new URLSearchParams(this.props.location.search).get('year'), 10);
        if (!year) {
            year = Math.floor(Math.random() * 300 + 1700);
            this.updateParams(year);
        }
        return year;
    }

    private updateParams(year: number) {
        const searchParams = new URLSearchParams(this.props.location.search);
        searchParams.set('year', `${year}`);
        this.props.history.push({
            pathname: '/',
            search: searchParams.toString()
        });
    }


}

export const HomePage = withRouter(HomePageUnrouted);
