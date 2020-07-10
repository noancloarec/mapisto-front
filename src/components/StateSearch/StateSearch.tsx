import { MapistoTerritory } from "src/entities/mapistoTerritory";
import React from 'react';
import { AutoComplete } from "antd";
import { MapistoState } from "src/entities/mapistoState";
import { MapistoAPI } from "src/api/MapistoApi";
import { Subject } from "rxjs";
import { debounceTime } from "rxjs/operators";
const { Option } = AutoComplete;

interface Props {
    limitedToTerritory?: MapistoTerritory;
    className?: string;
    onSelectedState?: (selected: MapistoState) => void;
    hiddenStatesId: number[];
    showNamesAtDate?: Date;
}
interface State {
    searchResults: MapistoState[];
    autoCompleteValue: string;
}
export class StateSearch extends React.Component<Props, State> {
    private pattern$: Subject<string>;
    public static defaultProps = {
        hiddenStatesId: [] as number[]
    };
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
        const isHidden = (mpState: MapistoState) => !!this.props.hiddenStatesId.find(st => st === mpState.stateId);
        MapistoAPI.searchState(pattern).subscribe(
            res => this.setState({ searchResults: res.filter(s => !isHidden(s)) })
        );
    }

    selectState(stateId: number) {
        const mpState = this.state.searchResults.find(s => s.stateId === stateId);
        console.log('select state ', stateId, mpState);
        if (this.props.onSelectedState) {
            this.props.onSelectedState(mpState);
        }
        this.setState({
            autoCompleteValue: this.props.showNamesAtDate && mpState.getName(this.props.showNamesAtDate) ?
                mpState.getName(this.props.showNamesAtDate)
                :
                mpState.getName(),
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
        return this.state.searchResults.map(mpState => {
            let color = mpState.getColor();
            let name = mpState.getName();
            if(this.props.showNamesAtDate){
                const rep = mpState.getRepresentation(this.props.showNamesAtDate);
                if(rep){
                    name = rep.name;
                    color = rep.color
                }
            }
            return (
                <Option key={mpState.stateId} value={"" + mpState.stateId}
                    disabled={this.props.limitedToTerritory && !mpState.overLapsWith(this.props.limitedToTerritory)}
                >
                    <div className="row">
                        <div className=" col-2 col-md-1 pl-2 pr-2" >
                            <div
                                style={({ backgroundColor: color, width: '100%', height: '100%' })}>
                            </div>
                        </div>
                        <div className="autocomplete-state-text col-4 col-md-5" translate="no">
                            {name}
                        </div>
                        <div className="col-3 text-muted">
                            {mpState.startYear}
                        </div>
                        <div className="col-3 text-muted">
                            {mpState.endYear<2020?mpState.endYear:'Today'}
                        </div>
                    </div>
                </Option >
            );
        }
        );
    }
}