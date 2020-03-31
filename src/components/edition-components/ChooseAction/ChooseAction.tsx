import React from "react";
import './ChooseAction.css';

interface Choice {
    text: string;
    action: () => void;
}
interface Props {
    choices: Choice[];
}

export class ChooseAction extends React.Component<Props, {}>{

    renderChoices() {
        return this.props.choices.map(choice =>
            <button className="mb-1 btn btn-outline-primary" onClick={choice.action}>
                {choice.text}
            </button>

        );
    }

    render() {
        return (
            <div className="correction-choice d-flex flex-column">
                <h1>What is wrong?</h1>
                {this.renderChoices()}
            </div>
        );
    }
}
