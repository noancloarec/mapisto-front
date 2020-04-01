import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators';
import { MapistoAPI } from 'src/api/MapistoApi';
import './StateAutoComplete.css';
import { LoadingIcon } from '../map-components/TimeNavigableMap/LoadingIcon';
import { dateFromYear } from 'src/utils/date_utils';

interface Props {
    startYear?: number;
    endYear?: number;
    initialPattern: string;
    mpStateChange: (newState: MapistoState) => void;
    allowStateCreation: boolean;
}
interface State {
    searchResults: MapistoState[];
    searchPattern: string;
    loading: boolean;
    outputedState: MapistoState;
}
export class StateAutoComplete extends React.Component<Props, State>{
    private patternChange$: Subject<void>;
    private searchSubscription: Subscription;
    public static defaultProps = {
        initialPattern: '',
        allowStateCreation: false
    };
    constructor(props: Props) {
        super(props);
        if (props.allowStateCreation && !(props.startYear && props.endYear)) {
            throw Error("Cannot allow state creation if start and end year are not set");
        }
        this.state = {
            searchResults: [],
            searchPattern: this.props.initialPattern,
            loading: false,
            outputedState: null
        };
        this.patternChange$ = new Subject<void>();
        this.patternChange$.pipe(
            tap(() => {
                if (!this.state.searchPattern) {
                    this.searchSubscription.unsubscribe();
                    this.setState({ searchResults: [], loading: false });
                }
            }),
            debounceTime(300)
        ).subscribe(
            () => this.searchStates(this.state.searchPattern)
        );
    }

    render() {
        return (
            <div className="state-autocomplete">
                <input
                    type="text" className="form-control"
                    value={this.state.searchPattern}
                    onChange={event =>
                        this.setState({ searchPattern: event.target.value, loading: true }, () =>
                            this.patternChange$.next()
                        )}
                />
                <div className="loading-icon">
                    <LoadingIcon loading={this.state.loading} thickness="4px" />
                </div>

                <div className="autocomplete-results">
                    {this.renderAutoCompleteResults()}
                    {this.props.allowStateCreation && this.renderCreationSuggestion()}
                </div>
            </div>
        );
    }


    renderAutoCompleteResults() {
        return this.state.searchResults.map((st, index) => (
            <div key={index} className="autocomplete-result form-control" onClick={() => this.selectState(st)}>
                <div className="state-color-indicator" style={({ backgroundColor: st.color })}></div>
                <div className="autocomplete-state-text">
                    {st.name}
                    <span className="autocomplete-muted">
                        ({st.validityStart.getUTCFullYear()}&nbsp;-&nbsp;
                    {st.validityEnd.getUTCFullYear()})
                    </span>
                </div>
            </div>
        ));
    }
    renderCreationSuggestion() {
        if (this.state.searchPattern && !this.state.loading &&
            !this.state.searchResults.find(s => s.name === this.state.searchPattern.trim())
            && !(this.state.outputedState && this.state.outputedState.name === this.state.searchPattern.trim())
        ) {
            return (
                <div key={this.state.searchResults.length}
                    className="autocomplete-result form-control" onClick={() => this.createStateAndOutput()}>
                    <div className="state-add-indicator">
                        <i className="fas fa-plus"></i>
                    </div>
                    <div className="autocomplete-state-text">
                        Create &nbsp;
                        {this.state.searchPattern}
                        <span className="autocomplete-muted">
                            ({this.props.startYear}&nbsp;-&nbsp;
                    {this.props.endYear})
                    </span>
                    </div>
                </div>

            );
        }
    }
    createStateAndOutput() {
        const toOutput = new MapistoState(
            dateFromYear(this.props.startYear), dateFromYear(this.props.endYear),
            undefined, this.state.searchPattern.trim(), [], '#000000', undefined
        )
        this.selectState(toOutput);
    }

    selectState(st: MapistoState) {
        this.props.mpStateChange(st);
        this.setState({
            searchResults: [],
            searchPattern: st.name,
            outputedState: st
        });
    }

    searchStates(pattern: string) {
        if (!pattern.trim()) {
            this.setState({
                searchResults: []
            });
            return;
        }
        this.searchSubscription = MapistoAPI.searchState(pattern, this.props.startYear, this.props.endYear)
            .subscribe(
                res => {
                    this.setState({
                        searchResults: res,
                        loading: false
                    }
                    );
                }
            );
    }
}