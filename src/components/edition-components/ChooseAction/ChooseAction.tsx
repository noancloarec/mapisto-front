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
        return this.props.choices.map((choice, index) =>
            <button className="mb-1 btn btn-outline-primary" key={index} onClick={choice.action}>
                {choice.text}
            </button>

        );
    }

    render() {
        return (
            <div className="correction-choice d-flex flex-column">
                <h1>What is wrong?</h1>
                <div className="d-flex justify-content-center">
                    <div className="d-flex flex-column">
                        {this.renderChoices()}
                    </div>
                </div>
            </div>
        );
    }
}
