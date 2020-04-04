import React from "react";
import { connect } from "react-redux";
import { MapistoState } from "src/entities/mapistoState";
import { MapistoAPI } from "src/api/MapistoApi";
import { dateFromYear } from "src/utils/date_utils";
import { RootState } from "src/store";
import { finishSuccessfullEdition } from "src/store/edition/actions";
interface StateProps {
    editedState: MapistoState;
}
interface DispatchProps {
    stateWasExtended: (m: MapistoState) => void;
}

interface State {
    concurrentStates: { state: MapistoState, selected: boolean }[];
    startYear: number;
    endYear: number;
    periodWasAdapted: boolean;
    periodTooSmallToCheck: boolean;
}
class ExtendStatePeriod extends React.Component<StateProps & DispatchProps, State> {

    constructor(props: StateProps & DispatchProps) {
        super(props);
        this.state = {
            periodWasAdapted: false,
            concurrentStates: [],
            periodTooSmallToCheck: false,
            startYear: this.props.editedState.startYear,
            endYear: this.props.editedState.endYear
        };
    }




    researchConcurrentStates() {
        MapistoAPI.getConcurrentStates(this.props.editedState.stateId, this.state.startYear, this.state.endYear)
            .subscribe(
                res => {
                    this.setState({
                        concurrentStates: res.map(s => ({
                            state: s,
                            selected: this.shouldSelect(s)
                        }))

                    });
                    this.adaptIntervalToCheckedStates();
                }
            );
    }

    adaptIntervalToCheckedStates() {
        const { start: computedStart, end: computedEnd } = this.getComputedPeriod();
        if (computedStart !== this.state.startYear) {
            this.setState({ startYear: computedStart });
        }
        if (computedEnd !== this.state.endYear) {
            this.setState({ endYear: computedEnd });
        }
        this.setState({
            periodWasAdapted: true
        });
    }

    private getComputedPeriod(): { start: number, end: number } {
        const checked = this.state.concurrentStates.filter(c => c.selected);
        if (checked.length) {

            return {
                start: Math.min(checked[0].state.startYear, this.state.startYear),
                end: Math.max(checked[checked.length - 1].state.endYear, this.state.endYear)
            };
        } else {
            return {
                start: this.state.startYear,
                end: this.state.endYear
            };
        }
    }

    shouldSelect(st: MapistoState): boolean {
        return this.sameName(st, this.props.editedState) ||
            this.state.concurrentStates.findIndex(e => e.state.stateId === st.stateId && e.selected) !== -1;
    }

    handleCheck(event: React.ChangeEvent<HTMLInputElement>, stateId: number) {
        this.setState({
            concurrentStates: this.state.concurrentStates.map(elem => {
                if (elem.state.stateId === stateId) {
                    return { ...elem, selected: event.target.checked };
                } else {
                    return elem;
                }
            })
        }, () => this.adaptIntervalToCheckedStates()
        );
    }


    handlePeriodChange(event: React.ChangeEvent<HTMLInputElement>, side: "start" | "end") {
        const newYear = parseInt(event.target.value, 10);
        switch (side) {
            case "start":
                this.setState({
                    startYear: newYear,
                    periodWasAdapted: false,
                    periodTooSmallToCheck: !newYear || newYear > this.props.editedState.startYear
                });

                break;
            case "end":
                this.setState({
                    endYear: newYear,
                    periodWasAdapted: false,
                    periodTooSmallToCheck: !newYear || newYear < this.props.editedState.endYear
                });
                break;

        }
    }

    private sameName(a: MapistoState, b: MapistoState): boolean {
        return a.name.toLowerCase() === b.name.toLowerCase();
    }

    renderCheckState(st: MapistoState, selected: boolean) {
        return <div className="form-check" key={st.stateId}>
            <input className="form-check-input" type="checkbox" defaultChecked={selected}
                id={st.stateId.toString()}
                disabled={this.sameName(st, this.props.editedState)}
                onChange={e => this.handleCheck(e, st.stateId)}
            />
            <label className="form-check-label" htmlFor={st.stateId.toString()}>
                {st.name} ({st.startYear}, {st.endYear})
                </label>
        </div>;
    }
    renderStateList() {
        return <form action="" onSubmit={(e) => { e.preventDefault(); this.extendState(); }}>
            {
                this.state.concurrentStates.length ?
                    this.state.concurrentStates.map(e => this.renderCheckState(e.state, e.selected)) :
                    (this.state.periodWasAdapted && <p>No conflict found</p>)

            }
            <button type="submit" disabled={!this.state.periodWasAdapted}>
                Extend {this.props.editedState.name} {
                    (this.state.periodWasAdapted && <span>from {this.state.startYear} to {this.state.endYear}</span>)}
            </button>
        </form>;
    }
    extendState() {
        MapistoAPI.extendState(
            this.props.editedState.stateId,
            this.state.startYear,
            this.state.endYear,
            this.state.concurrentStates.filter(c => c.selected).map(s => s.state.stateId))
            .subscribe(() => {
                this.props.stateWasExtended(new MapistoState(
                    dateFromYear(this.state.startYear),
                    dateFromYear(this.state.endYear),
                    this.props.editedState.stateId,
                    this.props.editedState.name,
                    this.props.editedState.territories,
                    this.props.editedState.color,
                    this.props.editedState.boundingBox,
                ));
            });
    }

    render() {
        return (
            <div>

                <form action="" onSubmit={(e) => { e.preventDefault(); this.researchConcurrentStates(); }}>
                    <label htmlFor="">Start year</label>
                    <input type="number"
                        value={isNaN(this.state.startYear) ? "" : this.state.startYear}
                        onChange={e => this.handlePeriodChange(e, "start")}
                    />
                    <label htmlFor="">End year</label>
                    <input type="number"
                        value={isNaN(this.state.endYear) ? "" : this.state.endYear}
                        onChange={e => this.handlePeriodChange(e, "end")}
                    />
                    <button type="submit" disabled={this.state.periodTooSmallToCheck}>Check conflicts</button>
                </form>
                {this.renderStateList()}
            </div >
        );
    }
}
const mapStateToProps = (state: RootState): StateProps => ({
    editedState: state.edition.selectedState
});
const mapDispatchToProps: DispatchProps = {
    stateWasExtended: () => finishSuccessfullEdition()
};
export const ExtendStatePeriodConnected = connect(mapStateToProps, mapDispatchToProps)(ExtendStatePeriod);