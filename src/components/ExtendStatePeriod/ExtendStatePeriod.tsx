import React from "react";
import { connect } from "react-redux";
import { RootState } from "src/store/reducer";
import { MapistoState } from "src/interfaces/mapistoState";
import { getConcurrentStates, extendState } from "src/api/MapistoApi";
import { finishEdition } from 'src/store/actions';
import { dateFromYear } from "src/utils/date_utils";
interface StateProps {
    editedState: MapistoState;
}
interface DispatchProps {
    finishEdition: (m: MapistoState) => void;
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
            startYear: this.props.editedState.validity_start.getUTCFullYear(),
            endYear: this.props.editedState.validity_end.getUTCFullYear()
        };
    }




    researchConcurrentStates() {
        getConcurrentStates(this.props.editedState.state_id, this.state.startYear, this.state.endYear).subscribe(
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
                start: Math.min(checked[0].state.validity_start.getUTCFullYear(), this.state.startYear),
                end: Math.max(checked[checked.length - 1].state.validity_end.getUTCFullYear(), this.state.endYear)
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
            this.state.concurrentStates.findIndex(e => e.state.state_id === st.state_id && e.selected) !== -1;
    }

    handleCheck(event: React.ChangeEvent<HTMLInputElement>, stateId: number) {
        this.setState({
            concurrentStates: this.state.concurrentStates.map(elem => {
                if (elem.state.state_id === stateId) {
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
                    periodTooSmallToCheck: !newYear || newYear > this.props.editedState.validity_start.getUTCFullYear()
                });

                break;
            case "end":
                this.setState({
                    endYear: newYear,
                    periodWasAdapted: false,
                    periodTooSmallToCheck: !newYear || newYear < this.props.editedState.validity_end.getUTCFullYear()
                });
                break;

        }
    }

    private sameName(a: MapistoState, b: MapistoState): boolean {
        return a.name.toLowerCase() === b.name.toLowerCase();
    }

    renderCheckState(st: MapistoState, selected: boolean) {
        return <div className="form-check" key={st.state_id}>
            <input className="form-check-input" type="checkbox" defaultChecked={selected}
                id={st.state_id.toString()}
                disabled={this.sameName(st, this.props.editedState)}
                onChange={e => this.handleCheck(e, st.state_id)}
            />
            <label className="form-check-label" htmlFor={st.state_id.toString()}>
                {st.name} ({st.validity_start.getUTCFullYear()}, {st.validity_end.getUTCFullYear()})
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
        extendState(
            this.props.editedState.state_id,
            this.state.startYear,
            this.state.endYear,
            this.state.concurrentStates.filter(c => c.selected).map(s => s.state.state_id))
            .subscribe(() => {
                this.props.finishEdition({
                    ...this.props.editedState,
                    validity_start: dateFromYear(this.state.startYear),
                    validity_end: dateFromYear(this.state.endYear)
                });
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
    editedState: state.selectedState
});

export const ExtendStatePeriodConnected = connect(mapStateToProps, { finishEdition })(ExtendStatePeriod);