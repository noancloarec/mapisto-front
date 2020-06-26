import React from 'react';
import { MapistoState } from 'src/entities/mapistoState';
import { StateSearch } from 'src/components/StateSearch/StateSearch';
import { Link } from 'react-router-dom';
import { Button } from 'antd';
import { MapistoAPI } from 'src/api/MapistoApi';

interface Props {
    stateToBeAbsorbed: MapistoState;
    onStatesMerged: (intoId: number) => void;
    className?: string;
}

interface State {
    parentMpState: MapistoState;
    childOverflows: boolean;
    loading: boolean;
}
export class MergeState extends React.Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            parentMpState: undefined,
            childOverflows: false,
            loading: false
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
                        parentMpState: st,
                        childOverflows:
                            st.validityStart > childmpState.validityStart ||
                            st.validityEnd < childmpState.validityEnd

                    })}
                    hiddenStatesId={[childmpState.stateId]}
                />
                {
                    this.state.childOverflows && (
                        <p className="text-danger">
                            Cannot merge state ({childmpState.startYear}, {childmpState.endYear})
                            into {parentMpState.getName()} ({parentMpState.startYear}, {parentMpState.endYear}) :
                    The period overflows
                            <Link to={`/edit_state/${this.state.parentMpState.stateId}`}>Extend its lifetime</Link>
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

    doMerge = () => {
        this.setState({
            loading: true
        });
        MapistoAPI.mergeStates(this.props.stateToBeAbsorbed.stateId, this.state.parentMpState.stateId).subscribe(
            () => {
                this.props.onStatesMerged(this.state.parentMpState.stateId);
                this.setState({ loading: false });
            }
        );
    }

    componentDidUpdate(prevProps: Props) {
        if (prevProps.stateToBeAbsorbed.stateId !== this.props.stateToBeAbsorbed.stateId) {
            this.setState({
                childOverflows: false,
                parentMpState: undefined
            })
        }
    }
}