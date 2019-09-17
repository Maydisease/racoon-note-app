import * as React        from "react";
import * as ReactDOM     from "react-dom";
import './share_panel.scss';
import {Service}         from "../../../../../lib/master.electron.lib";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import VRadio            from '../../../../component/radio';
import {request}         from "../../../services/requst.service";
import {VMessageService} from "../../../../component/message";

console.log();

class SharePanel extends React.Component {

    public props: any = {
        pos      : {
            x: 0,
            y: 0,
        },
        show     : true,
        shareInfo: {
            share_code    : '',
            on_share      : '',
            use_share_code: ''
        }
    };

    public state: any = {
        pos : {
            x: 0,
            y: 0,
        },
        show: false,
        conf: {
            on_share      : this.props.shareInfo.on_share,
            use_share_code: this.props.shareInfo.use_share_code,
            share_code    : this.props.shareInfo.share_code
        }
    };

    public myRef: any;

    public mountContainer: HTMLElement;
    public shareCodeElement: React.RefObject<HTMLInputElement>;
    public serverAddress = `${Service.Config.SERVER.HOST}:${Service.Config.SERVER.PORT}`;

    constructor(props: any) {
        super(props);
        this.props            = props;
        this.myRef            = React.createRef();
        this.shareCodeElement = React.createRef();
        this.closeSharePanel  = this.closeSharePanel.bind(this);
        this.shareConfChange  = this.shareConfChange.bind(this);
        this.getNewShareCode  = this.getNewShareCode.bind(this);
    }

    public shouldComponentUpdate(nextProps: any, nextState: any, nextContext: any): boolean {
        return true;
    }

    // public componentWillUpdate(nextProps: any, nextState: any, nextContext: any): void {
    // console.log('---v', nextProps);
    // const state = this.state;
    // state.conf = nextProps.shareInfo;
    // this.setState(state);
    // }

    // 向伏组件传递关闭事件
    public closeSharePanel() {
        const state = this.state;
        this.setState(state);
        this.props.cancelEvent();
    }

    public async getNewShareCode() {
        const params   = {
            id: this.state.conf.aid
        };
        const response = await request('note', 'updateArticleShareCode', {...params});
        if (response.result === 0) {
            const state            = this.state;
            const shareCodeElement = this.shareCodeElement.current as HTMLInputElement;
            shareCodeElement.value = response.data.shareCode;
            state.conf.share_code  = response.data.shareCode;
            this.setState(this.state);
        }

    }

    public copy(text: string) {
        Service.Clipboard.writeText(text);
        new VMessageService('copy to clipboard success!', 'success', 5000).init();
    }

    // 更改分享配置
    public async shareConfChange(name: string, value: number) {

        const state = this.state;

        switch (name) {
            case 'onShare':
                state.conf.on_share = value;
                break;
            case 'useShareCode':
                state.conf.use_share_code = value;
                break;
        }
        this.setState(state);

        const params = {
            id            : this.state.conf.aid,
            on_share      : this.state.conf.on_share,
            use_share_code: this.state.conf.use_share_code
        };

        console.log('source', {...params});

        const response = await request('note', 'updateArticleShareConf', {...params});

        if (response.result === 0) {
            console.log('更新成功', response);
        }

    }

    public renderModalContent(props: any, mountContainer: HTMLElement) {
        const x       = this.props.pos.x ? Number(this.props.pos.x) + 220 : 440;
        let y         = Number(this.props.pos.y || 0);
        let isReverse = false;

        // 判断展示的面板高度，当前视口是否能容纳的下，若无法容纳，则反向展示
        if (y + 260 > document.body.clientHeight) {
            y         = y - 70;
            isReverse = true;
        }

        console.log('sharePanel', this.props.shareInfo);

        ReactDOM.render(
            <div
                key={this.props.shareInfo.aid}
                id="v-sharePanel"
                className={`${this.props.show ? 'show' : ''} ${isReverse ? 'reverse' : ''}`}
                style={{top: y, left: x}}
            >
                <div className="wrap">

                    <div className="block">
                        <VRadio
                            name="onShare"
                            selected={this.props.shareInfo.on_share}
                            title="Enable Share"
                            change={this.shareConfChange}
                        />
                    </div>

                    <div className="block last">
                        <VRadio
                            name="useShareCode"
                            disable={this.state.conf.on_share === 0}
                            selected={this.props.shareInfo.use_share_code}
                            title="Use Share Code"
                            change={this.shareConfChange}
                        />
                    </div>

                    <div className="item">
                        <input
                            name="link"
                            readOnly={true}
                            placeholder="share link..."
                            type="text"
                            value={`${this.serverAddress}${this.props.shareInfo.share_address}`}
                        />
                        <div
                            className="btn"
                            onClick={this.copy.bind(this, `${this.serverAddress}${this.props.shareInfo.share_address}`)}
                        >
                            <FontAwesomeIcon icon="copy"/>
                        </div>
                    </div>

                    <div className="item last">
                        <input
                            key={this.props.shareInfo.share_code}
                            name="shareCode"
                            readOnly={true}
                            placeholder="share code..."
                            type="text"
                            ref={this.shareCodeElement}
                            value={this.state.conf.share_code || this.props.shareInfo.share_code}
                        />
                        <div
                            className="btn"
                            onClick={this.copy.bind(this, this.state.conf.share_code || this.props.shareInfo.share_code)}
                        >
                            <FontAwesomeIcon icon="copy"/>
                        </div>
                        <div className="btn" onClick={this.getNewShareCode}>
                            <FontAwesomeIcon icon="redo"/>
                        </div>
                    </div>

                </div>
            </div>,
            mountContainer
        );
    }

    public componentDidUpdate(nextProps: any) {
        if (nextProps.pos.y !== this.state.pos.y) {
            this.renderModalContent(this.props, this.mountContainer);
        }
    }

    public componentDidMount() {

        const state = this.state;

        state.conf = {
            aid           : this.props.shareInfo.aid,
            on_share      : this.props.shareInfo.on_share,
            use_share_code: this.props.shareInfo.use_share_code,
            share_code    : this.props.shareInfo.share_code,
        };

        this.setState(state);

        console.log('init:', this.props.shareInfo, this.state.conf);

        const tempContainer     = document.createElement('div');
        tempContainer.className = 'body-component-container';
        document.body.appendChild(tempContainer);
        this.mountContainer = tempContainer;
        this.renderModalContent(this.props, this.mountContainer);

        window.addEventListener('click', (event: Event) => {
            if (this.props.show) {
                let isSelf = false;
                (event as any).path.some((el: any) => {
                    if (el.id === 'v-sharePanel') {
                        isSelf = true;
                    }
                });

                if (!isSelf) {
                    console.log('----111');
                    this.closeSharePanel();
                }
            }
            event.preventDefault();
        }, true);

    }

    public render() {
        return (null)
    }
}

export default SharePanel;
