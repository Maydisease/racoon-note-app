import './message.scss';
import * as ReactDOM from "react-dom";
import * as React    from "react";

class Component extends React.Component {

    public props: any;

    public componentDidMount() {
        this.props.onRef(this);
    }

    public render() {
        return (
            <div id="v-message">
                <div className={`text ${this.props.msgType}`}>{this.props.msgText}</div>
            </div>
        )
    }
}

declare type IMessageType = 'common' | 'success' | 'error' | 'warning';

class VMessageService {

    public tempContainer: HTMLElement;

    public child: any;
    public containerClassName: string;
    public msgType: string;
    public msgText: string;
    public msgTimeoutMax: number;
    public timer: any;

    constructor(MessageText: string, MessageType: IMessageType, MessageTimeoutMax: number = 2000) {
        this.containerClassName = 'body-component-container';
        this.msgText            = MessageText;
        this.msgType            = MessageType;
        this.msgTimeoutMax      = MessageTimeoutMax;
        this.timer              = null;
    }

    public onRef = (ref: any) => {
        this.child = ref
    };

    public init() {
        const tempContainer     = document.createElement('div');
        tempContainer.className = this.containerClassName;
        document.body.appendChild(tempContainer);
        this.tempContainer = tempContainer;
        this.renderModalContent(this.tempContainer);
        this.timeOut();
    }

    public timeOut() {
        this.timer = setTimeout(() => {
            this.destroy();
        }, this.msgTimeoutMax);
    }

    public destroy() {
        clearTimeout(this.timer);
        ReactDOM.unmountComponentAtNode(this.tempContainer);
    }

    public renderModalContent(mountContainer: HTMLElement) {
        ReactDOM.render(
            <Component msgType={this.msgType} msgText={this.msgText} onRef={this.onRef}/>,
            mountContainer
        );
    }

}


export {VMessageService}