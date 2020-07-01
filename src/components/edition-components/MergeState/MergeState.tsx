import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { StateSearch } from 'src/components/StateSearch/StateSearch';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { MapistoAPI } from 'src/api/MapistoApi';
import { MapistoError } from 'src/api/MapistoError';
import { switchMap } from 'rxjs/operators';
import { forkJoin } from 'rxjs';

interface Props {
    stateToBeAbsorbed: MapistoState;
    onStatesMerged: (intoId: number) => void;
    className?: string;
    onTerritoriesReassigned: (intoId: number) => void;
}

interface State {
    parentMpState: MapistoState;
    childOverflows: boolean;
    loading: boolean;
    territoriesImpacted: number[];
}
export class MergeState extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            parentMpState: undefined,
            childOverflows: false,
            loading: false,
            territoriesImpacted: []
        };
    }
    render() {
        const childmpState = this.props.stateToBeAbsorbed;
        const parentMpState = this.state.parentMpState;
        return (
            <div className={this.props.className}>
                <StateSearch
                    className="col-12"
                    onSelectedState={st => this.setState({
                        parentMpState: st
                    })}
                    showNamesAtDate={this.props.stateToBeAbsorbed.validityStart}
                    hiddenStatesId={[childmpState.stateId]}
                />
                {
                    this.state.childOverflows && (
                        <p className="text-danger">
                            Cannot merge state ({childmpState.startYear}, {childmpState.endYear})
                            into {parentMpState.getName()} ({parentMpState.startYear}, {parentMpState.endYear}) :
                    The period overflows
                            <Link to={`/edit_state/${this.state.parentMpState.stateId}`}>Extend its lifetime</Link>,
                            <br />Or maybe you only want to reassign its
                             territories ({this.state.territoriesImpacted.join(', ')})
                             on the {parentMpState.getName()} period
                            <Button onClick={this.reassignTerritories} loading={this.state.loading}>
                                Reassign the territories
                            </Button>
                        </p>
                    )
                }
                <Button
                    className="mt-4"
                    type="primary"
                    onClick={this.doMerge}
                    loading={this.state.loading}
                    disabled={!this.state.parentMpState || this.state.childOverflows}
                >
                    Merge
                </Button>
            </div>
        );
    }

    reassignTerritories = () => {
        this.setState({
            loading: true
        });
        forkJoin(this.state.territoriesImpacted.map(id => MapistoAPI.loadTerritory(id).pipe(
            switchMap(territory => {
                territory.mpState = this.state.parentMpState;
                return MapistoAPI.editTerritory(territory);

            })
        ))).subscribe(
            () => {
                this.setState({
                    loading: false
                });
                this.props.onTerritoriesReassigned(this.state.parentMpState.stateId);
            }
        );
    }

    doMerge = () => {
        this.setState({
            loading: true
        });
        MapistoAPI.mergeStates(this.props.stateToBeAbsorbed.stateId, this.state.parentMpState.stateId).subscribe(
            () => {
                this.props.onStatesMerged(this.state.parentMpState.stateId);
                this.setState({ loading: false });
            },
            (error: MapistoError) => {
                this.setState({
                    childOverflows: true,
                    territoriesImpacted: error.data.territories_impacted as number[],
                    loading: false,
                });

            },
        );
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.stateToBeAbsorbed.stateId !== this.props.stateToBeAbsorbed.stateId) {
            this.setState({
                childOverflows: false,
                parentMpState: undefined
            });
        }
    }
}