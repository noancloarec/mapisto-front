import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, tap, filter } from 'rxjs/operators';
import { MapistoAPI } from 'src/api/MapistoApi';
import './StateAutoComplete.css';
import { LoadingIcon } from '../map-components/TimeNavigableMap/LoadingIcon';
import { dateFromYear } from 'src/utils/date_utils';

interface Props {
    maxStartYear?: number;
    minEndYear?: number;
    mpState: MapistoState;
    onMpStateChange: (newState: MapistoState) => void;
    autoFocus: boolean;
    colorEnabled: boolean;
    yearInputsEnabled: boolean;
    canShowStateCreation: boolean;
    onlySearch: boolean;
    placeholder: string;
}
interface State {
    searchResults: MapistoState[];
    loading: boolean;
    inputIsFocused: boolean;
    hoveredIndex: number;
    startYearInInput: string;
    endYearInInput: string;
}
/**
 * Component created to search through Mapisto states
 * Can allow the user to edit the state searched (used in error correction)
 * Or to create a new state (used to reassign territories)
 */
export class StateAutoComplete extends React.Component<Props, State>{
    private patternChange$: Subject<string>;

    private searchSubscription: Subscription;

    public static defaultProps = {
        autoFocus: false,
        canShowStateCreation: false,
        onlySearch: false,
        placeholder: ''
    };
    constructor(props: Props) {
        super(props);
        this.state = {
            searchResults: [],
            loading: false,
            inputIsFocused: false,
            hoveredIndex: -1,
            startYearInInput: this.props.mpState ? "" + this.props.mpState.startYear : '',
            endYearInInput: this.props.mpState ? "" + this.props.mpState.endYear : '',
        };
        this.patternChange$ = new Subject<string>();

        // Subscribe to output the state on any change
        this.patternChange$.subscribe(
            pattern => {
                const toOutput: MapistoState = Object.create(this.props.mpState);
                toOutput.name = pattern;
                this.props.onMpStateChange(toOutput);
            }
        );

        // Subscribe to research states on typing
        this.patternChange$.pipe(
            tap(pattern => {
                if (!pattern.trim()) {
                    this.cancelLoading();
                } else {
                    this.setState({ loading: true });
                }
            }),
            filter(pattern => !!pattern.trim()),
            debounceTime(300)
        ).subscribe(
            pattern => {
                this.searchStates(pattern);
            }
        );
    }

    render() {
        return (
            <div className="state-autocomplete">
                {
                    !this.props.onlySearch && (
                        <div>

                            <div className="input-group">
                                <input type="color" className="form-control col-2"
                                    value={this.props.mpState.color}
                                    disabled={!this.props.colorEnabled}
                                    onChange={event => this.handleColorChange(event.target.value)}
                                />
                                {this.renderInputSearch('col-4')}
                                <input
                                    placeholder="Creation year"
                                    type="number"
                                    className={"form-control col-3 " + (this.hasError("start") ? "is-invalid" : "")}
                                    disabled={!this.props.yearInputsEnabled}
                                    value={this.state.startYearInInput}
                                    onChange={event => this.handleChangeStart(event.target.value)}
                                />
                                <input
                                    placeholder="End year"
                                    type="number"
                                    className={"form-control col-3 " + (this.hasError("end") ? "is-invalid" : "")}
                                    disabled={!this.props.yearInputsEnabled}
                                    value={this.state.endYearInInput}
                                    onChange={event => this.handleChangeEnd(event.target.value)}
                                />
                            </div>

                            {(this.hasError('start') || this.hasError('end')) &&
                                (
                                    <div className="text-danger">
                                        The state period must include
                                         [{this.props.maxStartYear}, {this.props.minEndYear}]
                                    </div>
                                )
                            }
                        </div>
                    )
                }
                {
                    this.props.onlySearch && (
                        <div>
                            <i className="fas fa-search search-icon"></i>
                            {this.renderInputSearch('')}
                        </div>
                    )
                }
                <div className="loading-icon">
                    <LoadingIcon loading={this.state.loading} thickness="4px" />
                </div>
                {
                    (true || this.state.inputIsFocused) &&
                    (
                        <div className="autocomplete-results">
                            {this.renderAutoCompleteResults()}
                        </div>
                    )
                }
            </div>
        );
    }

    /**
     * Render the search input, separate from render() because input can be rendered in several manners
     * @param widthClass An additional class to give to the input
     */
    renderInputSearch(widthClass: string) {
        return (
            <input
                placeholder={this.props.placeholder}
                autoFocus={this.props.autoFocus}
                type="text" className={"form-control " + widthClass}
                value={this.props.mpState.name}
                onChange={event => this.patternChange$.next(event.target.value)}
                onKeyDown={event => this.handleKeySelection(event)}
                onFocus={() => this.setState({ inputIsFocused: true })}
                onBlur={() => setTimeout(() => this.setState({ inputIsFocused: false, hoveredIndex: -1 }), 100)}
            />
        );
    }

    /**
     * Renders the list of search suggestions / creation
     */
    renderAutoCompleteResults() {
        const res = [];
        const resultSize = this.state.searchResults.length + (this.canShowNewState() ? 1 : 0);
        for (let i = 0; i < resultSize; i++) {
            const renderNew = i === this.state.searchResults.length;
            res.push((
                <div key={i}
                    className={
                        "autocomplete-result form-control " + (this.state.hoveredIndex === i ? 'hovered' : '')
                    }
                    onMouseEnter={() => this.setState({
                        hoveredIndex: i
                    })}
                    onClick={() =>
                        renderNew ?
                            this.createStateAndOutput() : this.selectState(this.state.searchResults[i])
                    }
                    onMouseLeave={() => this.setState({
                        hoveredIndex: -1
                    })}
                >
                    {
                        renderNew ?
                            this.renderNewStateSearchResults()
                            :
                            this.renderExistingStateSearchResult(this.state.searchResults[i])
                    }
                </div>

            ));
        }
        return res;
    }

    /**
     * Renders a row of the search results
     * @param st The state to render in results bar
     */
    renderExistingStateSearchResult(st: MapistoState) {
        return (
            <div className="row">
                <div className=" col-2 col-md-1 pl-2 pr-2" >
                    <div className="state-color-indicator" style={({ backgroundColor: st.color })}>
                    </div>
                </div>
                <div className="autocomplete-state-text col-4 col-md-5">
                    {st.name}
                </div>
                <div className="col-3 text-muted">
                    {st.startYear}
                </div>
                <div className="col-3 text-muted">
                    {st.endYear}
                </div>

            </div>
        );

    }

    /**
     * Renders the row of search results which allows the user to create a new state
     */
    renderNewStateSearchResults() {
        return (
            <div className="row">
                <div className="col-1">
                    <i className="fas fa-plus"></i>
                </div>
                <div className="col-5">
                    Create &nbsp;
                        {this.props.mpState.name}
                </div>
                <div className="col-3 text-muted">
                    {this.props.maxStartYear}
                </div>
                <div className="col-3 text-muted">
                    {this.props.minEndYear}
                </div>
            </div>
        );
    }

    /**
     * Allows the user to navigate between the search results with keys
     * @param event the keyevent emitted by the input search
     */
    handleKeySelection(event: React.KeyboardEvent<HTMLInputElement>) {
        const searchResultSize = this.state.searchResults.length + (this.canShowNewState() ? 1 : 0);
        if (event.key === 'ArrowDown' && this.state.hoveredIndex < searchResultSize - 1
        ) {
            this.setState({
                hoveredIndex: this.state.hoveredIndex + 1
            });
            event.preventDefault();
        }
        if (event.key === 'ArrowUp' && this.state.hoveredIndex > -1) {
            this.setState({
                hoveredIndex: this.state.hoveredIndex - 1
            });
            event.preventDefault();
        }
        if (event.key === 'Enter' &&
            this.state.hoveredIndex >= 0) {
            if (this.state.hoveredIndex < this.state.searchResults.length) {
                this.selectState(this.state.searchResults[this.state.hoveredIndex]);
            } else if (this.state.hoveredIndex === this.state.searchResults.length) {
                this.createStateAndOutput();
            }
            event.preventDefault();
        }
    }

    /**
     * Creates a mpState with a new color and outputs it
     * @param color the new color
     */
    handleColorChange(color: string) {
        const toOutput: MapistoState = Object.create(this.props.mpState);
        toOutput.color = color;
        this.props.onMpStateChange(toOutput);
    }


    /**
     * Checks if the start date is valid, if so emits it to the parent component
     * Else the field is changed (so the user can type freely), but no state is emitted
     * @param start the start year written in the input
     */
    handleChangeStart(start: string) {
        this.setState({
            startYearInInput: start
        });
        const parsed = parseInt(start, 10);
        if (parsed && parsed <= this.props.maxStartYear) {
            const toOutput: MapistoState = Object.create(this.props.mpState);
            toOutput.startYear = parsed;
            this.props.onMpStateChange(toOutput);
        }
    }

    /**
     * Analogous to handleChangeStart()
     * @param end the end year in input
     */
    handleChangeEnd(end: string) {
        this.setState({
            endYearInInput: end
        });
        const parsed = parseInt(end, 10);
        if (parsed && parsed >= this.props.minEndYear) {
            const toOutput: MapistoState = Object.create(this.props.mpState);
            toOutput.endYear = parsed;
            this.props.onMpStateChange(toOutput);
        }
    }

    /**
     * Determines if a year field has an error, based on the constraints provided in props
     * An empty field also has an error
     * @param field the field to consider
     */
    hasError(field: "start" | "end") {
        const source = field === 'start' ? this.state.startYearInInput : this.state.endYearInInput;
        const parsed = parseInt(source, 10);
        if (field === "start" && this.props.maxStartYear && (!parsed || parsed > this.props.maxStartYear)) {
            return true;
        }
        if (field === "end" && this.props.minEndYear && (!parsed || parsed < this.props.minEndYear)) {
            return true;
        }
        return false;

    }

    /**
     * Creates a new state only from the name written in the search bar, outputs it
     */
    createStateAndOutput() {
        const toOutput = new MapistoState(
            dateFromYear(this.props.maxStartYear), dateFromYear(this.props.minEndYear),
            undefined, this.props.mpState.name.trim(), [], '#000000', undefined
        );
        this.selectState(toOutput);
    }

    /**
     * Selects a state from the search result
     * @param st the state to select
     */
    selectState(st: MapistoState) {
        this.props.onMpStateChange(st);
        this.setState({
            searchResults: [],
            hoveredIndex: -1,
            startYearInInput: "" + st.startYear,
            endYearInInput: "" + st.endYear,
        });
    }

    /**
     * Sends a search request to mapisto server
     * @param pattern The pattern to search in API
     */
    searchStates(pattern: string) {
        this.searchSubscription = MapistoAPI.searchState(pattern, this.props.maxStartYear, this.props.minEndYear)
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

    /**
     * Cancels loading
     * Used when the user enters an empty input
     */
    private cancelLoading() {
        if (this.searchSubscription) {
            this.searchSubscription.unsubscribe();
        }
        this.setState({ searchResults: [], loading: false, hoveredIndex: -1 });
    }

    /**
     * The user should not be suggested to create a state if there is a suggestion fulfilling their search
     */
    canShowNewState() {
        return this.props.canShowStateCreation && !this.suggestionsExactlyMatch();
    }

    /**
     * Tells if there is a suggestion fulfilling the user search
     */
    suggestionsExactlyMatch() {
        return this.state.searchResults.map(s => s.name.toLocaleLowerCase()).indexOf(
            this.props.mpState.name.trim().toLocaleLowerCase()
        ) > -1;
    }
}