import React from 'react';
import { MapistoTerritory } from 'src/entities/mapistoTerritory';
import { FocusedOnStateMap } from 'src/components/map-components/FocusedOnStateMap/FocusedOnStateMap';
interface Props {
    territory: MapistoTerritory;
}
export class ChangeStateOfTerritory extends React.Component<Props> {
    constructor(props: Props) {
        super(props);
    }

    render() {
        return (
            <div>
                <FocusedOnStateMap mpState={this.props.territory.mpState} />
                <p>
                    Its state is {this.props.territory.mpState.stateId}
                </p>
            </div>
        );
    }
}