import React from 'react';
import moment from 'moment';
import { RouteComponentProps, withRouter } from 'react-router';
import { MapistoState } from 'src/entities/mapistoState';
import { Button, Form, DatePicker } from 'antd';
import Icon, { LeftOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { MapistoAPI } from 'src/api/MapistoApi';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
import { StateInput } from 'src/components/form-components/StateInput';
import { catchError, delay } from 'rxjs/operators';
import { of } from 'rxjs';
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
            <div className="container">
                <h2 className="text-center">
                    Sovereign State
                                </h2>
                {
                    mpState && (
                        <div >
                            <FocusedOnStateMap mpState={mpState} />
                            <Form onSubmitCapture={() => this.saveModification()}>
                                <StateInput value={this.state.modifiedMpState} onChange={st => this.setState({
                                    modifiedMpState: st
                                })} />
                                <div className="text-danger">{this.state.errorMessage}</div>
                                <Button type="primary" htmlType="submit" loading={this.state.loading}
                                    danger={!!this.state.errorMessage} >
                                    Save changes
                                </Button>
                            </Form>

                        </div>
                    )
                }
                <div className="m-2 d-flex justify-content-center">
                    <Button type="primary" icon={<LeftOutlined />}
                        onClick={this.props.history.goBack} > Back</Button>

                </div>
            </div>
        );
    }

    saveModification() {
        this.setState({ errorMessage: '', loading: true });
        MapistoAPI.putState(this.state.modifiedMpState).pipe(
            catchError(e => { this.setState({ errorMessage: e, loading: false }); return of() }),
            delay(500),
        ).subscribe(() => {
            this.setState({
                loading: false,
            });
        });
    }


    componentDidMount() {
        this.loadState(+this.props.match.params.state_id);
    }

    private loadState(stateId: number) {
        MapistoAPI.loadState(stateId).subscribe(
            t => this.setState({ mpState: t, modifiedMpState: t })
        );
    }

}

export const EditStatePage = withRouter(EditStatePageUnrouted);
