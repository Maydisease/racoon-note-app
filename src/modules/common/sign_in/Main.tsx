import * as React        from 'react';
import {Service}         from '../../../lib/master.electron.lib';
import {Link}            from "react-router-dom";
import {VMessageService} from '../../component/message';

interface Props {
    verifyState: number,
    inputName: string
}

interface State {
    t: any,
    from: {
        username?: {
            value: string,
            verify: number,
            verifyText: string
        },
        password?: {
            value: string,
            verify: number,
            verifyText: string
        },
    },
}

class SignInMain extends React.Component<Props, State> {

    public state = {
        t   : undefined,
        from: {
            username: {
                value     : '',
                verify    : 0,
                verifyText: ''
            },
            password: {
                value     : '',
                verify    : 0,
                verifyText: ''
            }
        }
    };

    constructor(props: any) {
        super(props);
        this.handleBlur   = this.handleBlur.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSignIn = this.handleSignIn.bind(this);
    }

    // submit 登录
    public async handleSignIn(): Promise<void | boolean> {

        const username = this.state.from.username.value;
        const password = this.state.from.password.value;

        // 如果用户名验证未通过
        if (!await this.asyncVerifyUser()) {
            return false;
        }

        // 如果密码验证未通过
        if (!this.verifyPassword()) {
            return false;
        }

        // 用户登录请求
        const signInResponse = await new Service.ServerProxy('User', 'signIn', {username, password}).send();

        // 网络出错
        if (signInResponse.result === 1 && signInResponse.err) {
            Service.Dialog.showErrorBox('sign in', 'Oops! network error');
            return false;
        }

        // 如果用户账号密码匹配，并且登录成功
        if (signInResponse.result === 0 && signInResponse.messageCode === 2000) {

            // 那么把服务端的token，委托主线程存储至sqlite中
            const signStateResponse: any = await Service.ClientCache('/user/signState').putSignState(signInResponse.data.token, signInResponse.data.private_space);

            // 存入成功，并向主渲染线程发送登录成功事件
            if (signStateResponse.raw > 0) {
                Service.RenderToRender.emit('master@signInSuccessful', {emitAuthor: 'sign'});
                // 并且关闭当前登录窗口
                Service.DestroyTargetWin('sign');
            }
            // 如果存入失败
            else {
                Service.Dialog.showErrorBox('cache', 'Cache update failed');
            }

        }

        // 如果登录失败
        else {
            Service.Dialog.showErrorBox('sign in', 'Sign in failed, email password does not match');
        }

    }

    // 验证用户是否有效
    public async asyncVerifyUser(): Promise<boolean | void> {

        const state    = this.state;
        const username = this.state.from.username.value;

        // 用户名不能为空
        if (!this.state.from.username.value || this.state.from.username.value === '') {
            state.from.username.verify     = 2;
            this.setState(state);
            const message = 'Email cannot be empty';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        // 向服务端发送用户有效性校验请求
        const asyncVerifyUserResponse = await new Service.ServerProxy('User', 'asyncVerifyUser', {username}).send();

        // 网络出错
        if (asyncVerifyUserResponse.result === 1 && asyncVerifyUserResponse.err) {
            Service.Dialog.showErrorBox('sign in', 'Oops! network error');
            return false;
        }

        // 账号不存在，设置表单验证信息状态
        if (asyncVerifyUserResponse.result === 0 && asyncVerifyUserResponse.data.state === 2) {
            state.from.username.verify     = 2;
            this.setState(state);
            const message = 'Email does not exist';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        // 账号存啊在，设置表单验证信息状态
        else if (asyncVerifyUserResponse.result === 0 && asyncVerifyUserResponse.data.state === 1) {
            state.from.username.verify     = 1;
            state.from.username.verifyText = '';
            this.setState(state);
            return true;
        }

        // 意外错误
        else {
            state.from.username.verify     = 2;
            this.setState(state);
            const message = 'Unexpected error';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

    }

    // 验证密码是否有效
    public verifyPassword(): boolean | void {

        const state    = this.state;
        const password = this.state.from.password.value;

        // 密码为空，设置表单验证状态
        if (!password || password === '') {
            state.from.password.verify     = 2;
            this.setState(state);
            const message = 'Password cannot be empty';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        // 密码符合，设置表单验证状态
        else {
            state.from.password.verify     = 1;
            state.from.password.verifyText = '';
            this.setState(state);
            return true;
        }

    }

    // 表单数据绑定, 同步至state.from中
    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
    }

    // 表单焦点丢失，处理表单验证环节
    public handleBlur(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.name === 'username') {
            this.asyncVerifyUser();
        }
        if (event.target.name === 'password') {
            this.verifyPassword();
        }
    }

    public componentDidMount(): void {
        document.body.onkeydown = (async (event: KeyboardEvent) => {
            if (event.code === 'Enter') {
                await this.handleSignIn();
            }
        });
    }

    public render() {
        return (
            <div id="login">
                <div className="login-container">
                    <h2>Sign in to Note</h2>
                    <div className="from">
                        <div className="item input">
                            <div className="wrap">
                                <div className="icon"/>
                                <input name="username" placeholder="email" value={this.state.from.username.value} onBlur={this.handleBlur} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="item input">
                            <div className="wrap">
                                <div className="icon"/>
                                <input name="password" placeholder="password" value={this.state.from.password.value} onBlur={this.handleBlur} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="item">
                            <div className="wrap">
                                <button onClick={this.handleSignIn}>Sign in</button>
                            </div>
                        </div>
                    </div>
                    <h4>New to Note?<em><Link to="/sign_up">Create an account.</Link></em></h4>
                </div>
            </div>
        );
    }
}

export default SignInMain;
