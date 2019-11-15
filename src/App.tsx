import './fontawesome';
import './App.scss';
import './statics/common/fonts/iconfont.scss';
import './statics/themes/dark/style.scss';
import './statics/themes/white/style.scss';
import * as React                                from 'react';
import env                                       from './config/env';
import NoteMain                                  from './modules/note/Main';
import Attached                                  from './modules/common/attached';
import NoteSuperSearch                           from './modules/note/components/super_search';
import TestMain                                  from './modules/test/Main';
import TodoMain                                  from './modules/todo/Main';
import SignInMain                                from './modules/common/sign_in/Main';
import SignUpMain                                from './modules/common/sign_up/Main';
import ForgetPasswordMain                        from './modules/common/forget_password/Main';
import DefaultMain                               from './modules/Main';
import NetworkMonitorMain                        from './modules/monitor/network/Main';
import {Route, Redirect}                         from "react-router-dom";
import {Service}                                 from "./lib/master.electron.lib";
import {store}                                   from "./store";
import {storeSubscribe}                          from "./store/middleware/storeActionEvent.middleware";
import {$SuperSearchService, SuperSearchService} from "./modules/note/services/window_manage/superSearch.server";
import {FontAwesomeIcon}                         from "@fortawesome/react-fontawesome";


class App extends React.Component {

    public state = {
        route: {
            path: ''
        }
    };

    public superSearchService: SuperSearchService;

    constructor(props: any) {
        super(props);
        this.routeJump          = this.routeJump.bind(this);
        this.superSearchService = $SuperSearchService;
    }

    public routeJump() {
        const state      = this.state;
        state.route.path = state.route.path === '/test' ? '/note' : '/test';
        this.setState(state as any);
    }

    public componentDidMount() {

        Service.IPCRenderer.on('windowKeyboard', (event: any, arg: any) => {
            store.dispatch({'type': `WINDOW_KEYBOARD$${arg}`});
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_SHIFT_F', () => {
            this.superSearchService.open();
        });
    }

    public render() {
        return (
            <div id="app">
                <Route path="/" exact={true} component={DefaultMain}/>
                <Route path="/note" component={NoteMain}/>
                <Route path="/note_search" component={NoteSuperSearch}/>
                <Route path="/test" component={TestMain}/>
                <Route path="/todo" component={TodoMain}/>
                <Route path="/sign_in" component={SignInMain}/>
                <Route path="/sign_up" component={SignUpMain}/>
                <Route path="/forget_password" component={ForgetPasswordMain}/>
                <Route path="/attached" component={Attached}/>
                <Route path="/monitor/network" component={NetworkMonitorMain}/>
                {
                    env.isDev ?
                        <div id="app-route-bottom" onClick={this.routeJump}>
                            <FontAwesomeIcon className="fa-icon" icon="bug"/>
                        </div>
                        : null
                }
                {
                    (env.isDev && this.state.route.path && window.location.pathname !== this.state.route.path) ?
                        <Redirect
                            to={{
                                pathname: this.state.route.path,
                            }}
                        />
                        : null
                }
            </div>
        );
    }
}

export default App;
