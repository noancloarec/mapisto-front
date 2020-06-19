import { MapistoTerritory } from "src/entities/mapistoTerritory";
import React from 'react';
import { AutoComplete, Input, Spin, Tooltip } from "antd";
import { MapistoState } from "src/entities/mapistoState";
import { MapistoAPI } from "src/api/MapistoApi";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
const { Option } = AutoComplete;

interface Props {
    limitedToTerritory?: MapistoTerritory;
    className: string;
    onSelectedState?: (selected: MapistoState) => void;
}
interface State {
    searchResults: MapistoState[];
    autoCompleteValue: string;
}
export class StateSearch extends React.Component<Props, State> {
    private pattern$: Subject<string>;
    constructor(props: Props) {
        super(props);
        this.pattern$ = new Subject<string>();
        this.state = {
            searchResults: [],
            autoCompleteValue: '',
        };
        this.pattern$.pipe(
            debounceTime(500)
        ).subscribe(p => this.doSearch(p));

        this.pattern$.subscribe(p => this.setState({
            autoCompleteValue: p
        }));
    }

    doSearch(pattern: string) {
        if (!pattern.trim()) {
            this.setState({
                searchResults: []
            });
            return;
        }
        MapistoAPI.searchState(pattern).subscribe(
            res => this.setState({ searchResults: res })
        );
    }

    selectState(stateId: number) {
        const mpState = this.state.searchResults.find(s => s.stateId === stateId);
        if (this.props.onSelectedState) {
            this.props.onSelectedState(mpState);
        }
        this.setState({
            autoCompleteValue: mpState.getName(mpState.validityStart),
            searchResults: [mpState]
        });
    }

    render() {
        return (
            <AutoComplete
                onSearch={pattern => this.pattern$.next(pattern)}
                onSelect={stateId => this.selectState(+stateId)}
                value={this.state.autoCompleteValue}
                className={this.props.className}
            >
                {this.renderStateOptions()}
            </AutoComplete >
        );
    }


    renderStateOptions() {
        return this.state.searchResults.map(mpState => (
            <Option key={mpState.stateId} value={"" + mpState.stateId}
                disabled={this.props.limitedToTerritory && !mpState.overLapsWith(this.props.limitedToTerritory)}
            >
                <div className="row">
                    <div className=" col-2 col-md-1 pl-2 pr-2" >
                        <div className="state-color-indicator"
                            style={({ backgroundColor: mpState.getColor(mpState.validityStart) })}>
                        </div>
                    </div>
                    <div className="autocomplete-state-text col-4 col-md-5" translate="no">
                        {mpState.getName(mpState.validityStart)}
                    </div>
                    <div className="col-3 text-muted">
                        {mpState.startYear}
                    </div>
                    <div className="col-3 text-muted">
                        {mpState.endYear}
                    </div>
                </div>
            </Option >
        ));
    }
}