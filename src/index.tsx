import * as React      from 'react';
import * as ReactDOM   from 'react-dom';
import App             from './App';
import './index.scss';
import {BrowserRouter} from 'react-router-dom';
import {Provider}      from 'react-redux';
import {store}         from './store';

ReactDOM.render((
        <BrowserRouter>
            <Provider store={store}>
                <App/>
            </Provider>
        </BrowserRouter>
    ), document.getElementById('root') as HTMLElement
);
