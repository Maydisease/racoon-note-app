import {applyMiddleware, combineReducers, compose, createStore} from 'redux';
import {storeActionEventMiddleware}                             from './middleware/storeActionEvent.middleware';
import {reducers}                                               from './reducers';

const store = createStore(
    combineReducers(reducers),
    compose(
        applyMiddleware(storeActionEventMiddleware)
        // (window as any).devToolsExtension ? (window as any).devToolsExtension() : (f: any) => f
    )
);

export {store}