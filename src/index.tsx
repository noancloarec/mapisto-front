import React from "react";
import { render } from "react-dom";
// import { Provider } from "react-redux";
// import store from "./store/store";
// import App from "./App";
import './index.css';
// import { MapistoState } from "./interfaces/mapistoState";
// import { ViewBoxLike } from '@svgdotjs/svg.js';
import { FocusedOnStateMap } from "./components/map-components/FocusedOnStateMap/FocusedOnStateMap";
import { NavigableMap } from "./components/map-components/NavigableMap/NavigableMap";
import { TimeNavigableMap } from "./components/map-components/TimeNavigableMap/TimeNavigableMap";
import { FocusedOnTerritoryMap } from "./components/map-components/FocusedOnTerritoryMap/FocusedOnTerritoryMap";
import { MapistoTerritory } from "./entities/mapistoTerritory";
import { dateFromYear } from "./utils/date_utils";
import { InteractiveMap } from "./components/map-components/InteractiveMap/InteractiveMap";
// const vb: ViewBoxLike = { x: 0, y: 0, width: 1000, height: 500 };
// const mpStates: MapistoState[] = [
//     {
//         "color": "#8d2a3b",
//         "name": "Austria-Hungary",
//         "state_id": 84,
//         "territories": [
//             {
//                 precision_level: 1,
//                 "d_path": "M 150.0,0.0 L 75.0,200.0 L 225.0,200.0 L 150.0,0.0 z",
//                 "territory_id": 671,
//                 "validity_end": new Date("1919-01-01T00:00:00"),
//                 "validity_start": new Date("1918-01-01T00:00:00")
//             }
//         ],
//         bounding_box: null,
//         "validity_end": new Date("1920-01-01T00:00:00Z"),
//         "validity_start": new Date("1912-01-01T00:00:00Z")
//     }];
render(
    <div>
        {/* <MapistoMap
            viewbox={vb}
            enableNavigation
            onViewBoxChange={(vb: ViewBoxLike, precision) => console.log(precision)}
            mpStates={mpStates}>
        </MapistoMap > */}
        {/* <FocusedOnStateMap state_id={79} year={1918}></FocusedOnStateMap> */}
        {/* <div style={({ width: '100%' })}>
            <FocusedOnTerritoryMap
                territory={new MapistoTerritory(dateFromYear(1918), dateFromYear(1919), "", 332, 10, {
                    height: 70,
                    width: 80,
                    x: 1041,
                    y: 363
                })}
                year={1918}
            >

            </FocusedOnTerritoryMap>
        </div> */}
        <div style={({ width: '100%', height: '100vh' })}>
            <InteractiveMap></InteractiveMap>
        </div>
    </div >
    , document.getElementById('root')
);


// render(
//     <Provider store={store}>
//         <App />
//     </Provider>,
//     document.getElementById("root")
// );