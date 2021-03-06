import * as React        from 'react';
import {Service}         from '../../../lib/master.electron.lib';
import {Link, Redirect}  from "react-router-dom";
import {request}         from "../../note/services/requst.service";
import {VMessageService} from '../../component/message';
import {VLoadingService} from "../../component/loading";

interface Props {
    verifyState: number,
    inputName: string,
    redirect?: boolean,
    jumpAddress?: string
}

interface State {
    t: any,
    redirect: boolean,
    jumpAddress: string,
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
        repassword?: {
            value: string,
            verify: number,
            verifyText: string
        },
    },
}

class SignUpMain extends React.Component<Props, State> {

    public state = {
        t          : undefined,
        redirect   : false,
        jumpAddress: '',
        from       : {
            username  : {
                value     : '',
                verify    : 0,
                verifyText: ''
            },
            password  : {
                value     : '',
                verify    : 0,
                verifyText: ''
            },
            repassword: {
                value     : '',
                verify    : 0,
                verifyText: ''
            }
        },
    };

    constructor(props: Props) {
        super(props);
        this.handleBlur   = this.handleBlur.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSignUp = this.handleSignUp.bind(this);
    }

    public componentDidMount(): void {
        document.body.onkeydown = (async (event: KeyboardEvent) => {
            if (event.code === 'Enter') {
                await this.handleSignUp();
            }
        });
    }

    // 用户注册提交
    public async handleSignUp(): Promise<object | void | boolean> {

        // 校验用户名是否符合规则 && 校验用户是否存在
        if (!await this.asyncVerifyUser()) {
            return false;
        }

        // 校验密码是否符合规则
        if (!this.verifyUserPassword()) {
            return false;
        }

        // 校验两次密码是否一致
        if (!this.verifyUserRepassword()) {
            return false;
        }

        const postBody = {
            'username'  : this.state.from.username.value,
            'password'  : this.state.from.password.value,
            'repassword': this.state.from.repassword.value
        };

        const loading = new VLoadingService({});
        loading.init();

        // 向服务端发送注册用户请求
        const response = await request('User', 'addUserData', postBody);
        loading.destroy();

        // 如果注册成功
        if (response.result === 0) {
            // 'sign', 'registration success'
            Service.Dialog.showMessageBox({
                    title  : 'sign',
                    type   : 'none',
                    detail : 'registration success',
                    message: 'sign up',
                    buttons: ['Go to sign in'],
                },
                // btn 按钮被点击，跳转至登录界面
            ).then(async (result: any) => {
                const state       = this.state;
                state.redirect    = true;
                state.jumpAddress = '/sign_in';
                this.setState(state);
            });
        }

        // 如果注册失败
        else {
            Service.Dialog.showErrorBox('sign', 'registration failure');
        }

    }

    // 校验用户是否存在
    public async asyncVerifyUser(): Promise<boolean> {

        const username = this.state.from.username.value;
        const state    = this.state;

        // 用户名不能为空
        if (!username || username === '') {
            state.from.username.verify = 2;
            this.setState(state);
            const message = 'Email cannot be empty';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        // 邮箱校验规则
        else if (new RegExp(/^[a-zA-Z0-9_.-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z0-9]{2,6}$/).test(username)) {

            // 校验用户是否存在
            const response = await request('User', 'asyncVerifyUser', {username});

            if (response.result === 1) {
                Service.Dialog.showErrorBox('sign', 'registration failure');
                return false;
            }

            // 如果存在，那么设置表单校验状态
            if (response.data && response.data.state === 1) {
                state.from.username.verify = 2;
                this.setState(state);
                const message = 'The email already exists';
                new VMessageService(message, 'validate', 5000).init();
                return false;
            }

            // 如果不存在，那么设置表单校验状态
            else {
                state.from.username.verify = 1;
                this.setState(state);
                return true;
            }
        }
        // 用户名不符合规则，那么设置表单校验状态
        else {
            state.from.username.verify = 2;
            this.setState(state);
            const message = 'Please enter your vaild email';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

    }

    // 校验密码是否符合规则
    public verifyUserPassword() {
        const state    = this.state;
        const password = this.state.from.password.value;

        // 校验密码是否符合 0-9、a-z、A-Z 长度为6-16位的组合，并设置表单校验状态
        if (new RegExp(/^[0-9a-zA-Z]{6,16}$/).test(password)) {
            state.from.password.verify     = 1;
            state.from.password.verifyText = '';
            this.setState(state);
            return true;
        }
        // 如果不符合、那么设置表单校验状态
        else {
            state.from.password.verify = 2;
            this.setState(state);
            const message = 'The password must be longer than 5 digits or less than 16 digits.';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }
    };

    // 校验重复密码是否一致
    public verifyUserRepassword() {

        const password           = this.state.from.password.value;
        const repassword: string = this.state.from.repassword.value;

        const state = this.state;

        // 校验重复密码字段是否存在，并设置表单校验状态
        if (!repassword || repassword === '') {
            state.from.repassword.verify = 2;
            this.setState(state);
            const message = 'repassword cannot be empty';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        // 校验重复密码字段是否存在，并设置表单校验状态
        else if (password.length > 0 && repassword.length > 0) {

            // 校验两次密码是否相等，并设置表单校验状态
            if (password === repassword) {
                state.from.repassword.verify     = 1;
                state.from.repassword.verifyText = '';
                this.setState(state);
                return true;
            }
            // 校验两次密码是否相等，并设置表单校验状态
            else {
                state.from.repassword.verify = 2;
                this.setState(state);
                const message = 'The repassword do not match';
                new VMessageService(message, 'validate', 5000).init();
                return false;
            }
        }
        // 意外的错误
        else {
            state.from.repassword.verify = 2;
            this.setState(state);
            const message = 'Unexpected error';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

    }

    // 表单修改时的数据同步
    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
    }

    // 表单焦点丢失事件，处理表单的验证
    public handleBlur(event: React.ChangeEvent<HTMLInputElement>) {
        if (event.target.name === 'username') {
            this.asyncVerifyUser();
        }

        if (event.target.name === 'password') {
            this.verifyUserPassword();
        }

        if (event.target.name === 'repassword') {
            this.verifyUserRepassword();
        }
    }

    // 页面渲染
    public render() {

        // 路由跳转组件
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

            <div id="login">
                <RouteJump redirect={this.state.redirect} jumpAddress={this.state.jumpAddress}/>
                <div className="login-container">
                    <h2>Sign up to Note</h2>
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
                                <input name="password" type="password" placeholder="password" value={this.state.from.password.value} onBlur={this.handleBlur} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="item input">
                            <div className="wrap">
                                <div className="icon"/>
                                <input name="repassword" type="password" placeholder="repassword" value={this.state.from.repassword.value} onBlur={this.handleBlur} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="item">
                            <div className="wrap">
                                <button onClick={this.handleSignUp}>Sign up</button>
                            </div>
                        </div>
                    </div>
                    <h4><em><Link to="/sign_in">Go to sign in</Link></em></h4>
                </div>
            </div>
        );
    }
}

export default SignUpMain;
