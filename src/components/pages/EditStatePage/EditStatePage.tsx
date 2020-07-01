import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { MapistoState } from 'src/entities/mapistoState';
import { Button, Form } from 'antd';
import { LeftOutlined } from '@ant-design/icons';
import { MapistoAPI } from 'src/api/MapistoApi';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { StateInput } from 'src/components/form-components/StateInput';
import { catchError, delay } from 'rxjs/operators';
import { of } from 'rxjs';
import { MergeState } from 'src/components/edition-components/MergeState/MergeState';
import { Header } from 'src/components/Header/Header';
type Props = RouteComponentProps<{ state_id: string }>;
interface State {
    mpState: MapistoState;
    modifiedMpState: MapistoState;
    loading: boolean;
    errorMessage: string;
}
class EditStatePageUnrouted extends React.Component<Props, State>{

    constructor(props: Props) {
        super(props);
        this.state = {
            mpState: undefined,
            modifiedMpState: undefined,
            loading: false,
            errorMessage: ""
        };
    }
    render() {
        const mpState = this.state.mpState;
        return (
            <div>
                <Header />

                <div className="container">
                    <h2 className="text-center">
                        Sovereign State
                                </h2>
                    {
                        mpState && (
                            <div >
                                <FocusedOnStateMap mpState={mpState} />
                                <div className="m-4 row justify-content-center">

                                    <Form className="col-12 col-sm-6"
                                        onSubmitCapture={() => this.saveModification()}>
                                        <StateInput value={this.state.modifiedMpState} onChange={st => this.setState({
                                            modifiedMpState: st
                                        })} />
                                        {
                                            this.state.errorMessage && (
                                                <div>
                                                    <p className="text-danger">
                                                        {this.state.errorMessage}
                                                    </p>
                                                    <Button type="ghost" danger onClick={
                                                        () => this.saveModification(true)
                                                    }>
                                                        Force extend
                                                </Button>
                                                </div>
                                            )
                                        }
                                        <Button type="primary" htmlType="submit" loading={this.state.loading}
                                            danger={!!this.state.errorMessage} >
                                            Save changes
                                    </Button>
                                    </Form>
                                </div>
                                <h2 className="mt-3 decorated-title">
                                    Or
                                </h2>
                                <div className="row justify-content-center">
                                    <div className="col-12 col-lg-6">
                                        <p className="row">
                                            This state was under the sovereignty of another state
                                </p>
                                        <MergeState className="row"
                                            stateToBeAbsorbed={mpState}
                                            onStatesMerged={stateId =>
                                                this.props.history.push(`/edit_state/${stateId}`)}
                                            onTerritoriesReassigned={stateId => this.props.history.push(`/edit_state/${stateId}`)}
                                        />
                                    </div>

                                </div>
                            </div >
                        )
                    }
                    <div className="m-2 d-flex justify-content-center">
                        <Button type="primary" icon={<LeftOutlined />}
                            onClick={this.props.history.goBack} > Back</Button>

                    </div>
                </div >
            </div>
        );
    }

    saveModification(forceExtend = false) {
        this.setState({ errorMessage: '', loading: true });
        MapistoAPI.putState(this.state.modifiedMpState, forceExtend).pipe(
            catchError(e => { this.setState({ errorMessage: e, loading: false }); return of(); }),
            delay(500),
        ).subscribe(() => {
            this.setState({
                loading: false,
                mpState: this.state.modifiedMpState,
                errorMessage: ''
            });
        });
    }


    componentDidMount() {
        this.loadState(+this.props.match.params.state_id);
    }
    componentDidUpdate(prevProps: Props) {
        if (prevProps.match.params.state_id !== this.props.match.params.state_id) {
            this.loadState(+this.props.match.params.state_id);
        }
    }

    private loadState(stateId: number) {
        MapistoAPI.loadState(stateId).subscribe(
            t => this.setState({ mpState: t, modifiedMpState: t, errorMessage: '' })
        );
    }

}

export const EditStatePage = withRouter(EditStatePageUnrouted);
