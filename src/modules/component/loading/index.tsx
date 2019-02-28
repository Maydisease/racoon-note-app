import './loading.scss';
import * as ReactDOM from "react-dom";
import * as React    from "react";

class Component extends React.Component {

    public props: any;

    public componentDidMount() {
        this.props.onRef(this);
    }

    public render() {
        return (
            <div id="v-loading">
                <div className="loading"><i className="iconfont icon-refresh"/></div>
            </div>
        )
    }
}

class VLoadingService extends React.Component {

    public tempContainer: HTMLElement;
    public timer: any;

    public child: any;
    public containerClassName: string;
    public maxTimeoutCount: number;

    constructor(props: any) {
        super(props);
        this.containerClassName = 'body-component-container';
        this.timer              = null;
        this.maxTimeoutCount    = 8000;
    }

    public onRef = (ref: any) => {
        this.child = ref
    };

    public init(maxTimeoutCount = this.maxTimeoutCount) {
        const tempContainer     = document.createElement('div');
        tempContainer.className = this.containerClassName;
        document.body.appendChild(tempContainer);
        this.tempContainer = tempContainer;
        this.renderModalContent(this.props, this.tempContainer);
        this.timeout(maxTimeoutCount);
    }

    public timeout(maxTimeoutCount: number) {
        this.timer = setTimeout(() => {
            ReactDOM.unmountComponentAtNode(this.tempContainer);
        }, maxTimeoutCount);
    }

    public destroy() {
        clearTimeout(this.timer);
        ReactDOM.unmountComponentAtNode(this.tempContainer);
    }

    public renderModalContent(props: any, mountContainer: HTMLElement) {
        ReactDOM.render(
            <Component onRef={this.onRef}/>,
            mountContainer
        );
    }

}


export {VLoadingService}