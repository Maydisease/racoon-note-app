import * as React       from 'react';
import {Service}        from '../../../lib/master.electron.lib';
import {Link, Redirect} from "react-router-dom";

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

        // 向服务端发送注册用户请求
        const request = await new Service.ServerProxy('User', 'addUserData', postBody).send();

        // 如果注册成功
        if (request.result === 0) {
            // 'sign', 'registration success'
            Service.Dialog.showMessageBox({
                    title  : 'sign',
                    type   : 'none',
                    detail : 'registration success',
                    message: 'sign up',
                    buttons: ['Go to sign in'],
                },
                // btn 按钮被点击，跳转至登录界面
                () => {
                    const state       = this.state;
                    state.redirect    = true;
                    state.jumpAddress = '/sign_in';
                    this.setState(state);
                }
            );
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
            state.from.username.verify     = 2;
            state.from.username.verifyText = 'Account cannot be empty';
            this.setState(state);
            return false;
        }

        // 用户名规则应符合字母开头、0-9、a-z、A-Z，长度为6-12 位的组合
        else if (new RegExp(/^[a-zA-Z][0-9a-zA-Z]{5,11}$/).test(username)) {

            // 校验用户是否存在
            const request = await new Service.ServerProxy('User', 'asyncVerifyUser', {username}).send();

            if (request.result === 1) {
                Service.Dialog.showErrorBox('sign', 'registration failure');
                return false;
            }

            // 如果存在，那么设置表单校验状态
            if (request.data.state === 1) {
                state.from.username.verify     = 2;
                state.from.username.verifyText = 'The account already exists';
                this.setState(state);
                return false;
            }

            // 如果不存在，那么设置表单校验状态
            else {
                state.from.username.verify     = 1;
                state.from.username.verifyText = '';
                this.setState(state);
                return true;
            }
        }
        // 用户名不符合规则，那么设置表单校验状态
        else {
            state.from.username.verify     = 2;
            state.from.username.verifyText = 'Account should be 6-12 digits long, with underscore letters and numbers';
            this.setState(state);
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
            state.from.password.verify     = 2;
            state.from.password.verifyText = 'The password must be longer than 5 digits or less than 16 digits.';
            this.setState(state);
            return false;
        }
    };

    // 校验重复密码是否一致
    public verifyUserRepassword() {

        const password   = this.state.from.password.value;
        const repassword = this.state.from.repassword.value;

        const state = this.state;

        // 校验重复密码字段是否存在，并设置表单校验状态
        if (!repassword || repassword === '') {
            state.from.repassword.verify     = 2;
            state.from.repassword.verifyText = 'repassword cannot be empty';
            this.setState(state);
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
                state.from.repassword.verify     = 2;
                state.from.repassword.verifyText = 'The repassword do not match';
                this.setState(state);
                return false;
            }
        }
        // 意外的错误
        else {
            state.from.repassword.verify     = 2;
            state.from.repassword.verifyText = 'Unexpected error';
            this.setState(state);
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

        // 表单校验规则组件
        const VerifyTips = (props: Props): any => {
            const state = props.verifyState;
            if (state === 2) {
                return <div className='verify-tips error'>{this.state.from[props.inputName].verifyText}</div>;
            } else {
                return ''
            }
        };

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
                                <input name="username" placeholder="username" value={this.state.from.username.value} onBlur={this.handleBlur} onChange={this.handleChange}/>
                            </div>
                            <VerifyTips verifyState={this.state.from.username.verify} inputName='username'/>
                        </div>
                        <div className="item input">
                            <div className="wrap">
                                <div className="icon"/>
                                <input name="password" type="password" placeholder="password" value={this.state.from.password.value} onBlur={this.handleBlur} onChange={this.handleChange}/>
                            </div>
                            <VerifyTips verifyState={this.state.from.password.verify} inputName='password'/>
                        </div>
                        <div className="item input">
                            <div className="wrap">
                                <div className="icon"/>
                                <input name="repassword" type="password" placeholder="repassword" value={this.state.from.repassword.value} onBlur={this.handleBlur} onChange={this.handleChange}/>
                            </div>
                            <VerifyTips verifyState={this.state.from.repassword.verify} inputName='repassword'/>
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