import * as React         from 'react';
import * as ReactDOM      from 'react-dom';
import App                from './App';
import {BrowserRouter}    from 'react-router-dom';
import {Provider}         from 'react-redux';
import {store}            from './store';
import * as serviceWorker from './serviceWorker';
import './index.scss';

ReactDOM.render((
        <BrowserRouter>
            <Provider store={store}>
                <App/>
            </Provider>
        </BrowserRouter>
    ), document.getElementById('root') as HTMLElement
);

serviceWorker.register();