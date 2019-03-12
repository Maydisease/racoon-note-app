import './light_box.scss';
import * as ReactDOM from "react-dom";
import * as React    from "react";

class Component extends React.Component {

    public props: any = {
        handleClose: Function,
        imageUrl   : ''
    };

    constructor(props: any) {
        super(props);
        this.props       = props;
        this.handleClose = this.handleClose.bind(this);
    }

    public componentDidMount() {
        this.props.onRef(this);
    }

    public handleClose() {
        this.props.handleClose(this.props.mountContainer)
    }

    public render() {
        return (
            <div id="v-lightBox">
                <img src={this.props.imageUrl}/>
                <div className="mask" onClick={this.handleClose}/>
            </div>
        )
    }
}

class VLightBoxService extends React.Component {

    public mountContainer: HTMLElement;
    public timer: any;

    public child: any;
    public containerClassName: string;

    public props = {
        imageUrl: ''
    };

    constructor(props: any) {
        super(props);
        this.containerClassName = 'body-component-container';
        this.props              = props;
    }

    public onRef = (ref: any) => {
        this.child = ref
    };

    public init() {
        const mountContainer     = document.createElement('div');
        mountContainer.className = this.containerClassName;
        document.body.appendChild(mountContainer);
        this.mountContainer = mountContainer;
        this.renderModalContent(this.props, this.mountContainer);
    }

    public destroy(tempContainer: HTMLElement) {
        ReactDOM.unmountComponentAtNode(tempContainer ? tempContainer : this.mountContainer);
    }

    public renderModalContent(props: any, mountContainer: HTMLElement) {
        ReactDOM.render(
            <Component imageUrl={this.props.imageUrl} mountContainer={this.mountContainer} onRef={this.onRef} handleClose={this.destroy}/>,
            mountContainer
        );
    }

}


export {VLightBoxService}