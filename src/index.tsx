import React from "react";
import { render } from "react-dom";
import './index.css';
import { store } from 'src/store/index';
import { Provider } from "react-redux";
import App from "./App";
import { StateAutoComplete } from "./components/form-components/StateAutoComplete";
render(
    // <Provider store={store}>
    //     <App />
    // </Provider>,
    <div className="col-4 mt-2 offset-4">
        <StateAutoComplete mpStateChange={(res) => console.log(res)} allowStateCreation={true} startYear={1912} endYear={1999} />
        <div>Coucoucou</div>
    </div>,
    document.getElementById("root")
);