import { combineReducers, createStore, compose } from "redux";
import { editionReducer } from "./edition/reducer";
import { mainMapReducer } from "./main-map/reducer";

const rootReducer = combineReducers({
    edition: editionReducer,
    mainMap: mainMapReducer
});

export type RootState = ReturnType<typeof rootReducer>;

declare global {
    interface Window {
        __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
    }
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export const store = createStore(
    rootReducer,
    composeEnhancers()
);
