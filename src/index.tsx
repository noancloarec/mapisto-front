import React from "react";
import { render } from "react-dom";
// import { Provider } from "react-redux";
// import store from "./store/store";
// import App from "./App";
import './index.css';
import { MapistoMap } from "./components/map-components/WorldMap/WorldMap";
import { MapistoState } from "./interfaces/mapistoState";
import { ViewBoxLike } from '@svgdotjs/svg.js';
const vb: ViewBoxLike = { x: 0, y: 0, width: 1000, height: 500 };
const mpStates: MapistoState[] = [
    {
        "color": "#8d2a3b",
        "name": "Austria-Hungary",
        "state_id": 84,
        "territories": [
            {
                precision_level: 1,
                "d_path": "M 150.0,0.0 L 75.0,200.0 L 225.0,200.0 L 150.0,0.0 z",
                "territory_id": 671,
                "validity_end": new Date("1919-01-01T00:00:00"),
                "validity_start": new Date("1918-01-01T00:00:00")
            }
        ],
        bounding_box: null,
        "validity_end": new Date("1920-01-01T00:00:00Z"),
        "validity_start": new Date("1912-01-01T00:00:00Z")
    }];
render(
    <MapistoMap viewbox={vb} mpStates={mpStates}></MapistoMap >, document.getElementById('root')
);


// render(
//     <Provider store={store}>
//         <App />
//     </Provider>,
//     document.getElementById("root")
// );