import * as React                       from 'react';
import NoteMain                         from './modules/note/Main';
import Attached                         from './modules/common/attached';
import NoteSuperSearch                  from './modules/note/components/super_search';
import RSSMain                          from './modules/rss/Main';
import TodoMain                         from './modules/todo/Main';
import SignInMain                       from './modules/common/sign_in/Main';
import SignUpMain                       from './modules/common/sign_up/Main';
import DefaultMain                      from './modules/Main';
import {BrowserRouter as Router, Route} from "react-router-dom";

import './fontawesome';
import './App.scss';
import './statics/common/fonts/iconfont.scss';
import './statics/themes/dark/style.scss';
import './statics/themes/white/style.scss';


class App extends React.Component {
    public render() {
        return (
            <Router>
                <div id="app">
                    <Route path="/" exact={true} component={DefaultMain}/>
                    <Route path="/note" component={NoteMain}/>
                    <Route path="/note_search" component={NoteSuperSearch}/>
                    <Route path="/rss" component={RSSMain}/>
                    <Route path="/todo" component={TodoMain}/>
                    <Route path="/sign_in" component={SignInMain}/>
                    <Route path="/sign_up" component={SignUpMain}/>
                    <Route path="/attached" component={Attached}/>
                </div>
            </Router>
        );
    }
}

export default App;
