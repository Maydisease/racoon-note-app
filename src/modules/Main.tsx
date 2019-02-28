import * as React from 'react';
import Login      from './component/Logo/Logo';
import {Service}  from '../lib/master.electron.lib';
import {Redirect} from "react-router";

class DefaultMain extends React.Component {

    public state: any = {
        redirect   : false,
        jumpAddress: ''
    };

    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        Service.RenderToRender.subject('sign@signInSuccessful', () => {
            const state       = this.state;
            state.redirect    = true;
            state.jumpAddress = '/note';
            this.setState(state);
        });
    }

    public render() {

        const RouteJump = (props: any): any => {
            const redirectState: boolean = props.redirect;
            const jumpAddress: string    = props.jumpAddress;
            if (redirectState) {
                return <Redirect push={true} to={jumpAddress}/>;
            } else {
                return '';
            }
        };

        return (
            <div id="defaultMain">
                <RouteJump redirect={this.state.redirect} jumpAddress={this.state.jumpAddress}/>
                <div className="logo">
                    <Login/>
                </div>
            </div>
        );
    }
}

export default DefaultMain;
