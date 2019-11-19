import * as React        from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {connect}         from "react-redux";
import {request}         from "../../../services/requst.service";
import {store}           from "../../../../../store";
import {VMessageService} from "../../../../component/message";
import {VLoadingService} from "../../../../component/loading";
import './lock.scss';

class LockComponent extends React.Component {

    public state: any = {
        inputFocusState: false,
        from           : {
            lockPassword: {
                value: ''
            }
        }
    };

    public lockInputElement: React.RefObject<HTMLInputElement>;

    constructor(props: any) {
        super(props);
        this.lockInputElement  = React.createRef();
        this.handleInputActive = this.handleInputActive.bind(this);
        this.handleChange      = this.handleChange.bind(this);
        this.submitUnlock      = this.submitUnlock.bind(this);
    }

    public handleInputActive(sourceState: any) {
        const state           = this.state;
        state.inputFocusState = !(!sourceState && this.state.from.lockPassword.value.length === 0);
        this.setState(state);
    }

    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
    }

    public componentDidUpdate(prevProps: any, prevState: any) {
        const NEW_ARTICLE = (this.props as any).STORE_NOTE$ARTICLE;
        const OLD_ARTICLE = prevProps.STORE_NOTE$ARTICLE;
        const element     = (this.lockInputElement.current as HTMLInputElement);
        if (NEW_ARTICLE.id !== OLD_ARTICLE.id) {
            element.focus();
        }
    }

    public componentDidMount() {
        document.body.onkeydown = (async (event: KeyboardEvent) => {
            if (event.code === 'Enter' && this.state.inputFocusState) {
                await this.submitUnlock();
            }
        });
    }

    // 提交解锁到服务端
    public async submitUnlock(): Promise<boolean | void> {
        if (!this.state.from.lockPassword.value) {
            const msg = 'Unlock password cannot be empty!';
            new VMessageService(msg, 'warning', 3000).init();
            return false;
        }

        const loading = new VLoadingService({});
        loading.init();
        const ARTICLE  = (this.props as any).STORE_NOTE$ARTICLE;
        const password = this.state.from.lockPassword.value;
        const response = await request('note', 'setArticleLockState', {id: ARTICLE.id, lock: 0, password});
        loading.destroy();

        if (response.result === 0) {

            store.dispatch({
                type    : 'NOTE$UPDATE_ARTICLE',
                playload: {
                    id   : ARTICLE.id,
                    cid  : ARTICLE.cid,
                    title: ARTICLE.title,
                    lock : 0
                }
            });

            store.dispatch({
                type: 'NOTE$UNLOCK_ARTICLE'
            });
        } else {
            switch (response.messageCode) {
                case 1004:
                    const msg = 'Unlock failed, password error!';
                    new VMessageService(msg, 'error', 3000).init();
                    break;
            }
        }

    }

    public render() {
        return (
            <div className="wrap lock-mod">
                <div className="plane">
                    <FontAwesomeIcon className="icon" icon="lock"/>
                    <div className="text">Note is encrypted</div>
                    <div className="form">
                        <div className={`wrap ${this.state.inputFocusState && 'focus'}`}>
                            <div className={`formBox ${this.state.inputFocusState && 'focus'}`}>
                                <FontAwesomeIcon className="lockIcon fa-icon" icon="key"/>
                                <input
                                    ref={this.lockInputElement}
                                    name="lockPassword"
                                    type="password"
                                    value={this.state.from.lockPassword.value}
                                    onFocus={this.handleInputActive.bind(this, true)}
                                    onBlur={this.handleInputActive.bind(this, false)}
                                    placeholder="password"
                                    onChange={this.handleChange}
                                    autoFocus={true}
                                />
                            </div>
                            <div className='buttonIcon' onClick={this.submitUnlock}>
                                <FontAwesomeIcon className="fa-icon" icon="chevron-right"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default connect<any>((state: any): any => state)(LockComponent);
