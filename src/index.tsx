import React from "react";
import { render } from "react-dom";
import './index.css';
import { store } from 'src/store/index';
import { Provider } from "react-redux";
import App from "./App";
render(
    // <div className="offset-3 mt-4 col-6">
    //     <StateAutoComplete
    //         // initialState={new MapistoState(
    //         //     dateFromYear(1912), dateFromYear(1960), undefined,
    //         //     "United States", [], '#000000', undefined
    //         // )}
    //         autoFocus
    //         onMpStateChange={s => console.log(s)}
    //         // allowStateCreation
    //         // maxStartYear={1912}
    //         // minEndYear={1914}
    //         allowStateEdition
    //     ></StateAutoComplete >
    // </div>,
    <Provider store={store}>
        <App />
    </Provider>,
    document.getElementById("root")
);