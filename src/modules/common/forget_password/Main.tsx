import * as React        from 'react';
import {Service}         from '../../../lib/master.electron.lib';
import {Link}            from "react-router-dom";
import {request}         from "../../note/services/requst.service";
import {VLoadingService} from "../../component/loading";
import {VMessageService} from '../../component/message';

interface Props {
    verifyState: number,
    inputName: string
    history: any
}

interface State {
    t: any,
    from: {
        username?: {
            value: string
            verify: number
        },
        verifycode?: {
            value: string
            verify: number
        },
        password?: {
            value: string
            verify: number
        },
        repassword?: {
            value: string
            verify: number
        }
    },
    displayPWState: boolean,
    isVerifyCodeSend: boolean,
    sendTimerText: number
}

class ForgetPasswordMain extends React.Component<Props, State> {

    public state = {
        t               : undefined,
        from            : {
            username  : {
                value : '',
                verify: 0
            },
            verifycode: {
                value : '',
                verify: 0
            },
            password  : {
                value     : '',
                verify    : 0,
                verifyText: ''
            },
            repassword: {
                value : '',
                verify: 0
            }
        },
        displayPWState  : false,
        isVerifyCodeSend: false,
        sendTimerText   : 0
    };

    public verifyCodesendTimer: any;

    constructor(props: any) {
        super(props);
        this.handleChange            = this.handleChange.bind(this);
        this.handleSubmit            = this.handleSubmit.bind(this);
        this.handleChangeHidePWState = this.handleChangeHidePWState.bind(this);
        this.sendVerifyMail          = this.sendVerifyMail.bind(this);
        this.setSendFlagTimer        = this.setSendFlagTimer.bind(this);
    }

    // submit 登录
    public async handleSubmit(): Promise<void | boolean> {

        const username   = this.state.from.username.value;
        const verifycode = this.state.from.verifycode.value;
        const password   = this.state.from.password.value;

        // 如果用户名验证未通过
        if (!await this.asyncVerifyUser()) {
            return false;
        }

        if (!await this.verifyCode()) {
            return false;
        }

        // 验证密码是否符合规则
        if (!await this.verifyUserPassword()) {
            return false;
        }

        // 验证两次密码是否一致
        if (!await this.verifyUserRepassword()) {
            return false;
        }

        const vload = new VLoadingService({});
        vload.init();
        const response = await request('User', 'changeUserPassword', {verifycode, username, password});
        vload.destroy();
        if (response.result === 1) {
            const state = this.state;
            let message = '';
            switch (response.messageCode) {
                case 1021:
                    state.from.verifycode.value = '';
                    message                     = 'Verify code error';
                    new VMessageService(message, 'validate', 5000).init();
                    break;
                case 1004:
                    state.from.username.value   = '';
                    state.from.verifycode.value = '';
                    message                     = 'Email address does not exist';
                    new VMessageService(message, 'validate', 5000).init();
                    break;
                case 1019:
                    state.from.password.value   = '';
                    state.from.repassword.value = '';
                    message                     = 'Password must be longer than 5 digits or less than 16 digits.';
                    new VMessageService(message, 'validate', 5000).init();
                    break;
                case 1022:
                    state.from.password.value   = '';
                    state.from.repassword.value = '';
                    message                     = 'Verification code failed to be sent, please resend';
                    new VMessageService(message, 'validate', 5000).init();
                    break;

            }
            this.setState(state);
        } else if (response.result === 0) {
            const state                 = this.state;
            state.from.verifycode.value = '';
            state.from.username.value   = '';
            state.from.password.value   = '';
            state.from.repassword.value = '';
            this.setState(state);

            Service.Dialog.showMessageBox({
                    title  : 'forget password',
                    type   : 'none',
                    detail : 'password was changed successfully. please log in with your new password.',
                    message: 'forget password',
                    buttons: ['ok'],
                },
                // btn 按钮被点击，跳转至登录界面
                () => {
                    this.props.history.push('/sign_in');
                }
            );

        }

    }

    // 验证用户是否有效
    public async asyncVerifyUser(): Promise<boolean | void> {

        const state    = this.state;
        const username = this.state.from.username.value;

        // 用户名不能为空
        if (!this.state.from.username.value || this.state.from.username.value === '') {
            state.from.username.verify = 2;
            this.setState(state);
            const message = 'Email cannot be empty';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        // 向服务端发送用户有效性校验请求
        const asyncVerifyUserResponse = await request('User', 'asyncVerifyUser', {username});

        // 网络出错
        if (asyncVerifyUserResponse.result === 1 && asyncVerifyUserResponse.err) {
            Service.Dialog.showErrorBox('sign in', 'Oops! network error');
            return false;
        }

        // 账号不存在，设置表单验证信息状态
        if (asyncVerifyUserResponse.result === 0 && asyncVerifyUserResponse.data.state === 2) {
            state.from.username.verify = 2;
            this.setState(state);
            const message = 'Email does not exist';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        // 账号存在，设置表单验证信息状态
        else if (asyncVerifyUserResponse.result === 0 && asyncVerifyUserResponse.data.state === 1) {
            state.from.username.verify = 1;
            this.setState(state);
            return true;
        }

        // 意外错误
        else {
            state.from.username.verify = 2;
            this.setState(state);
            const message = 'Unexpected error';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

    }

    // 验证码发送按钮倒计时
    public setSendFlagTimer() {
        if (!this.state.isVerifyCodeSend) {
            const state            = this.state;
            state.isVerifyCodeSend = true;
            this.setState(state);

            let i                    = 60;
            this.verifyCodesendTimer = setInterval(() => {
                const state$ = this.state;
                if (i > 0) {
                    state$.sendTimerText = i;
                } else {
                    state$.isVerifyCodeSend = false;
                    clearInterval(this.verifyCodesendTimer);
                }
                this.setState(state$);
                i--;
            }, 1000);
        }
    }

    // 发送邮件
    public async sendVerifyMail(): Promise<boolean> {

        if (this.state.isVerifyCodeSend) {
            return false;
        }

        const username = this.state.from.username.value;

        // 如果用户名验证未通过
        if (!await this.asyncVerifyUser()) {
            const message = 'please enter your vaild email';
            new VMessageService(message, 'validate', 5000).init();
            return false;
        }

        const vload = new VLoadingService({});
        vload.init();

        const sendVerifyMailResponse = await request('user', 'sendForgetPasswordVerifyMail', {username});
        this.setSendFlagTimer();
        vload.destroy();
        if (sendVerifyMailResponse.result === 1) {
            let message;
            switch (sendVerifyMailResponse.messageCode) {
                case 1000:
                    message = 'please enter your vaild email';
                    new VMessageService(message, 'validate', 5000).init();
                    break;
                case 1003:
                    message = 'username does not exist';
                    new VMessageService(message, 'validate', 5000).init();
                    break;
            }
        } else if (sendVerifyMailResponse.result === 0) {
            Service.Dialog.showMessageBox({
                    title  : 'forget password',
                    type   : 'none',
                    message: 'forget password email send',
                    detail : 'We have sent an email with your verification code to your mailbox, please check',
                    buttons: ['ok'],
                }
            );
        }
        return true;
    }

    // 校验验证码是否有效
    public async verifyCode() {
        const verifycode = this.state.from.verifycode.value + '';
        if (verifycode && verifycode.length === 6) {
            const state                  = this.state;
            state.from.verifycode.verify = 1;
            this.setState(state);
            return true;
        } else {
            const state                  = this.state;
            state.from.verifycode.verify = 2;
            this.setState(state);
            const message = 'The verification code consists of 6 digits';
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

        const password: string   = this.state.from.password.value;
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
                state.from.repassword.verify = 1;
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

    // 表单数据绑定, 同步至state.from中
    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
    }

    // 是否明文显示密码
    public handleChangeHidePWState() {
        const state          = this.state;
        state.displayPWState = !this.state.displayPWState;
        this.setState(state);
    }

    public componentDidMount(): void {
        document.body.onkeydown = (async (event: KeyboardEvent) => {
            if (event.code === 'Enter') {
                await this.handleSubmit();
            }
        });
    }

    public componentWillUnmount() {
        clearInterval(this.verifyCodesendTimer);
    }

    public render() {

        return (
            <div id="login">
                <div className="login-container">
                    <h2>Forget Password</h2>
                    <div className="from">
                        <div className="item input">
                            <div className="wrap">
                                <div className="icon"/>
                                <input name="username" placeholder="email" value={this.state.from.username.value} onChange={this.handleChange}/>
                            </div>
                        </div>
                        <div className="item input verifycode">
                            <div className="wrap">
                                <input
                                    name="verifycode"
                                    placeholder="verify code"
                                    value={this.state.from.verifycode.value}
                                    onChange={this.handleChange}
                                />
                            </div>
                            <button onClick={this.sendVerifyMail}>{this.state.isVerifyCodeSend ? this.state.sendTimerText : 'Send'}</button>
                        </div>
                        <div className="item input">
                            <div className="wrap">
                                <input
                                    name="password"
                                    type='text'
                                    placeholder="new password"
                                    value={this.state.from.password.value}
                                    onChange={this.handleChange}
                                />

                            </div>
                        </div>
                        <div className="item input">
                            <div className="wrap">
                                <input
                                    name="repassword"
                                    type='text'
                                    placeholder="repassword"
                                    value={this.state.from.repassword.value}
                                    onChange={this.handleChange}
                                />
                            </div>
                        </div>
                        <div className="item">
                            <div className="wrap">
                                <button onClick={this.handleSubmit}>Submit</button>
                            </div>
                        </div>
                    </div>
                    <h4>Callback to <em><Link to="/sign_in">Sign in.</Link></em></h4>
                </div>
            </div>
        );
    }
}

export default ForgetPasswordMain;
