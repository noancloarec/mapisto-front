import React, { FormEvent } from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { RootState } from 'src/store';
import { finishSuccessfullEdition } from 'src/store/edition/actions';
import { connect } from 'react-redux';
import { SelectCapitalMap } from 'src/components/map-components/SelectCapitalMap/SelectCapitalMap';
import './ExtendTerritoryPeriod.css';
import { MapistoAPI } from 'src/api/MapistoApi';
import { dateFromYear } from 'src/utils/date_utils';
import { FocusedOnTerritoryMap } from 'src/components/map-components/FocusedOnTerritoryMap/FocusedOnTerritoryMap';

interface StateProps {
    selectedState: MapistoState;
    selectedTerritory: MapistoTerritory;
    year: number;
}
interface DispatchProps {
    onTerritoryExtended: (newTerritory: MapistoTerritory, territoriesRemoved: MapistoTerritory[]) => void;
}
type Props = StateProps & DispatchProps;
interface State {
    capital: DOMPoint;
    step: number;
    startYear: string;
    endYear: string;
    restrictedStart: number;
    restrictedEnd: number;
    startMapDisplayed: DisplayedMap[];
    endMapDisplayed: DisplayedMap[];
    hiddenTerritories: MapistoTerritory[];
    conflictAtStart: MapistoTerritory;
    conflictAtEnd: MapistoTerritory;
    extensionButtonDisabled: boolean;
}
class ExtendTerritoryPeriod extends React.Component<Props, State>{
    toBeMerged: MapistoTerritory[];
    constructor(props: Props) {
        super(props);
        this.state = this.getInitialState();
    }

    private getInitialState(): State {
        return {
            capital: undefined,
            step: 1,
            startYear: "" + this.props.selectedTerritory.startYear,
            endYear: "" + this.props.selectedTerritory.endYear,
            restrictedStart: undefined,
            restrictedEnd: undefined,
            startMapDisplayed: [],
            endMapDisplayed: [],
            hiddenTerritories: [],
            conflictAtStart: undefined,
            conflictAtEnd: undefined,
            extensionButtonDisabled: true
        };

    }

    render() {
        return (
            <div id="extend-territory-period">
                <h1>Extend the territory period</h1>
                {this.state.step === 1 && this.renderClickOnCapital()}
                {this.state.step === 2 && this.renderExtensionWizard()}
            </div>
        );
    }

    renderClickOnCapital() {
        return (
            <div>
                <p>Click on the capital</p>
                <div>
                    <SelectCapitalMap
                        territory={this.props.selectedTerritory}
                        onCapitalChange={c => this.setState({ capital: c, step: 2 })}
                        year={this.props.year}
                    />
                </div>
                <small className="form-text text-muted">
                    Approximately locate the capital to help us prepare the extend operation
                    </small>

            </div>
        );
    }
    renderExtensionWizard() {
        return (
            <div id="territory-extension-wizard">
                <button className="btn btn-outline-primary" onClick={() => this.setState(this.getInitialState())}>
                    Back
                </button>
                {this.renderConflictCheckForm()}
                {this.renderConflictCheckResults()}
                <button className="btn btn-primary" disabled={this.state.extensionButtonDisabled}
                    onClick={() => this.extendTerritory()}
                >
                    Extend the territory
                </button>
            </div>

        );
    }

    extendTerritory() {
        MapistoAPI.extendTerritory(
            this.props.selectedTerritory.territoryId,
            this.state.restrictedStart,
            this.state.restrictedEnd,
            this.toBeMerged.map(t => t.territoryId)
        ).subscribe(
            res => this.props.onTerritoryExtended(res, this.toBeMerged)
        );
    }
    renderConflictCheckForm() {
        return (
            <form onSubmit={event => this.checkConcurrentTerritories(event)}>
                <div className="form-group">
                    <input className="form-control" type="number" value={this.state.startYear}
                        onChange={ev => this.setState({ startYear: ev.target.value, extensionButtonDisabled: true })}
                    />
                    {parseInt(this.state.startYear, 10) > this.props.selectedTerritory.startYear &&
                        (
                            <div className="form-warning">
                                Cannot be higher than {this.props.selectedTerritory.startYear}
                            </div>
                        )}
                    {parseInt(this.state.startYear, 10) < this.props.selectedState.startYear &&
                        (
                            <div className="form-warning">
                                Cannot extend to {this.state.startYear} :
                                {this.props.selectedState.name} was created in &nbsp;
                                {this.props.selectedState.startYear}
                            </div>
                        )}
                </div>
                <div className="form-group">
                    <input className="form-control" type="number" value={this.state.endYear}
                        onChange={ev => this.setState({ endYear: ev.target.value, extensionButtonDisabled: true })}
                    />
                    {parseInt(this.state.endYear, 10) < this.props.selectedTerritory.endYear &&
                        (
                            <div className="form-warning">
                                Cannot be lower than {this.props.selectedTerritory.endYear}
                            </div>
                        )}
                    {parseInt(this.state.endYear, 10) > this.props.selectedState.endYear &&
                        (
                            <div className="form-warning">
                                Cannot extend to {this.state.endYear} :
                                {this.props.selectedState.name} existed until &nbsp;
                                {this.props.selectedState.endYear}
                            </div>
                        )}
                </div>

                <button type="submit" disabled={!this.canCheckForConflit()}>Check conflicts</button>
            </form>
        );
    }
    renderConflictCheckResults() {
        return <div>
            <div className="map-list">
                {this.state.startMapDisplayed.length ?
                    (
                        <div className="row">
                            {this.renderMaps(this.state.startMapDisplayed, 0)}
                        </div>
                    )
                    : ""}
                {this.state.hiddenTerritories.length ? (
                    <div key={this.state.startMapDisplayed.length}>
                        {this.state.hiddenTerritories.length} other territories to be merged
                    between {this.state.restrictedStart} and {this.state.restrictedEnd}
                    </div>
                ) : ""}
                {this.state.endMapDisplayed.length ?
                    (
                        <div className="row">
                            {this.renderMaps(this.state.endMapDisplayed, this.state.startMapDisplayed.length + 1)}
                        </div>
                    )
                    : ""}
            </div>

            {
                this.state.conflictAtStart &&
                (
                    <small className="form-warning">
                        Conflict, the capital was part of another country before {this.state.restrictedStart}, the
                        start year was reset to {this.state.restrictedStart}
                    </small>
                )
            }
            {
                this.state.conflictAtEnd &&
                (
                    <small className="form-warning">
                        Conflict, the capital was part of another country after {this.state.restrictedEnd}, the
                        end year was reset to {this.state.restrictedEnd}
                    </small>
                )
            }

        </div>;
    }
    renderMaps(maps: DisplayedMap[], offset: number) {
        return maps.map((dMap, i) => (
            <div className="conflicting-territory-view col-4" key={i + offset}>
                <div>
                    <FocusedOnTerritoryMap key={i} territory={dMap.territory} year={dMap.year} />
                </div>
                <div className="text-center">
                    {dMap.year}
                </div>
                {
                    dMap.year < this.state.restrictedStart || dMap.year >= this.state.restrictedEnd ?
                        <small className="text-muted">Will not be affected</small>
                        :
                        <small className="alert-warning ">
                            Will be affected. Ensure the borders are the same as in {this.props.year}
                        </small>
                }
            </div>
        ));

    }


    private canCheckForConflit(): boolean {
        return (
            parseInt(this.state.startYear, 10) <= this.props.selectedTerritory.startYear
            && parseInt(this.state.startYear, 10) >= this.props.selectedState.startYear
            && parseInt(this.state.endYear, 10) >= this.props.selectedTerritory.endYear
            && parseInt(this.state.endYear, 10) <= this.props.selectedState.endYear
        );
    }

    checkConcurrentTerritories(event: FormEvent) {
        event.preventDefault();
        MapistoAPI.getConcurrentTerritories(
            this.props.selectedTerritory.territoryId,
            this.state.capital, parseInt(this.state.startYear, 10), parseInt(this.state.endYear, 10)).subscribe(
                res => this.updateCheckResults(res)
            );
    }

    private updateCheckResults(concurrents: MapistoTerritory[]) {
        const conflictAtStart = this.getConflictAtStart(concurrents);
        const conflictAtEnd = this.getConflictAtEnd(concurrents);
        const restrictedStart = conflictAtStart ?
            conflictAtStart.validityEnd : dateFromYear(parseInt(this.state.startYear, 10));
        const restrictedEnd = conflictAtEnd ?
            conflictAtEnd.validityStart : dateFromYear(parseInt(this.state.endYear, 10));
        this.toBeMerged = this.getConcurrentAllowedToMerge(concurrents, restrictedStart, restrictedEnd);

        const displayedMaps = this.computeDisplayedMaps(this.toBeMerged, restrictedStart, restrictedEnd);
        this.setState({
            restrictedStart: restrictedStart.getUTCFullYear(),
            restrictedEnd: restrictedEnd.getUTCFullYear(),
            startMapDisplayed: displayedMaps.startMaps,
            endMapDisplayed: displayedMaps.endMaps,
            hiddenTerritories: this.toBeMerged.filter(
                terr =>
                    [...displayedMaps.startMaps, ...displayedMaps.endMaps].map(m => m.territory)
                        .indexOf(terr) === -1),
            conflictAtStart,
            conflictAtEnd,
            startYear: restrictedStart.getUTCFullYear() + "",
            endYear: restrictedEnd.getUTCFullYear() + "",
            extensionButtonDisabled: false
        });
    }

    private getConflictAtStart(concurrents: MapistoTerritory[]): MapistoTerritory {
        return [...concurrents].reverse().find(t =>
            t.validityEnd <= this.props.selectedTerritory.validityStart &&
            t.stateId !== this.props.selectedState.stateId
        );
    }

    private getConflictAtEnd(concurrents: MapistoTerritory[]): MapistoTerritory {
        return concurrents.find(t =>
            t.validityStart >= this.props.selectedTerritory.validityEnd &&
            t.stateId !== this.props.selectedState.stateId
        );
    }

    private getConcurrentAllowedToMerge(concurrents: MapistoTerritory[], restrictedStart: Date, restrictedEnd: Date) {
        return concurrents.filter(t => t.validityStart >= restrictedStart && t.validityEnd <= restrictedEnd);
    }

    private computeDisplayedMaps(concurrents: MapistoTerritory[], restrictedStart: Date, restrictedEnd: Date) {
        let startMaps: DisplayedMap[] = [];
        // If the user changed the start date
        if (parseInt(this.state.startYear, 10) !== this.props.selectedTerritory.startYear) {
            startMaps = [{
                year: restrictedStart.getUTCFullYear() - 1, territory: this.props.selectedTerritory
            },
            ];
            if (concurrents.length) {
                const concurrentStartIsRestrictedStart =
                    restrictedStart.getTime() === concurrents[0].validityStart.getTime();

                if (concurrentStartIsRestrictedStart) {
                    startMaps.push({
                        year: concurrents[0].startYear,
                        territory: concurrents[0]
                    });
                    if (concurrents.length > 1) {
                        startMaps.push({
                            year: concurrents[1].startYear,
                            territory: concurrents[1]
                        });
                    }
                } else {
                    startMaps.push({
                        year: restrictedStart.getUTCFullYear(),
                        territory: this.props.selectedTerritory
                    });
                    startMaps.push({
                        year: concurrents[0].startYear,
                        territory: concurrents[0]
                    });

                }
            } else {
                startMaps.push({
                    year: restrictedStart.getUTCFullYear(),
                    territory: this.props.selectedTerritory
                });
            }
        }

        let endMaps: DisplayedMap[] = [];
        // If the user changed the end date
        if (parseInt(this.state.endYear, 10) !== this.props.selectedTerritory.endYear) {
            endMaps = [{
                year: restrictedEnd.getUTCFullYear(),
                territory: this.props.selectedTerritory
            },
            {
                year: restrictedEnd.getUTCFullYear() - 1,
                territory: this.props.selectedTerritory
            }
            ];
            if (concurrents.length) {
                const shouldDisplayLastConcurrent =
                    restrictedEnd.getTime() !== concurrents[concurrents.length - 1].validityEnd.getTime();
                if (shouldDisplayLastConcurrent) {
                    endMaps.push({
                        year: concurrents[concurrents.length - 1].endYear - 1,
                        territory: concurrents[concurrents.length - 1]
                    });

                }

            }
        }
        return {
            startMaps,
            endMaps: endMaps.reverse()
        };
    }
}
interface DisplayedMap {
    year: number;
    territory: MapistoTerritory;
}

const mapStateToProps = (state: RootState): StateProps => ({
    selectedState: state.edition.selectedState,
    year: state.mainMap.currentYear,
    selectedTerritory: state.edition.selectedTerritory
});

const mapDispatchToProps: DispatchProps = {
    onTerritoryExtended: () => finishSuccessfullEdition()
};
export const ExtendTerritoryPeriodConnected = connect(mapStateToProps, mapDispatchToProps)(ExtendTerritoryPeriod);