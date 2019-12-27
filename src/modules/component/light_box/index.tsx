import './light_box.scss';
import * as ReactDOM from "react-dom";
import * as React    from "react";

const openseadragon = require('openseadragon');

class Component extends React.Component {

    public lightBoxElementRef: React.RefObject<HTMLDivElement>;
    public viewer: any;

    public props: any = {
        handleClose: Function,
        imageUrl   : ''
    };

    constructor(props: any) {
        super(props);
        this.props              = props;
        this.handleClose        = this.handleClose.bind(this);
        this.viewResetHandle    = this.viewResetHandle.bind(this);
        this.viewCloseHandle    = this.viewCloseHandle.bind(this);
        this.lightBoxElementRef = React.createRef();
    }

    public componentDidMount() {
        const imageElement  = new Image();
        imageElement.src    = this.props.imageUrl;
        imageElement.onload = () => {
            const lightBoxElement = this.lightBoxElementRef.current;
            this.viewer           = openseadragon({
                element          : lightBoxElement,
                tileSources      : {
                    type     : 'image',
                    prefixUrl: 'canvasImageDrag',
                    url      : this.props.imageUrl,
                    size     : {
                        width : imageElement.width,
                        height: imageElement.height
                    }
                },
                debugMode        : false,
                autoHideControls : true,
                defaultZoomLevel : .5,
                autoResize       : true,
                minLevel         : .5,
                visibilityRatio  : 1,
                minZoomImageRatio: .5,
                maxZoomImageRatio: 1,
                zoomPerClick     : 1,
                zoomInButton     : "light-box-image-zoom-in",
                zoomOutButton    : "light-box-image-zoom-out"
            });

            // let flag = false;
            // this.viewer.addHandler('zoom', (eventSource: any) => {
            //     console.log(eventSource.zoom, this.viewer.minZoomImageRatio, flag);
            //     if (eventSource.zoom < this.viewer.minZoomImageRatio) {
            //         if (!flag) {
            //             flag             = true;
            //             eventSource.zoom = this.viewer.minZoomImageRatio;
            //             this.viewResetHandle();
            //         }
            //     } else {
            //         flag = false;
            //     }
            //     console.log(this.viewer.minZoomImageRatio);
            // });

            this.viewer.addHandler('open', (v: any) => {
                const source    = v.source;
                const imageSize = source.size;
                console.log(imageSize);

                const tiledImage = this.viewer.world.getItemAt(0); // Assuming you just have a single image in the viewer
                const targetZoom = tiledImage.source.dimensions.x / this.viewer.viewport.getContainerSize().x;
                this.viewer.viewport.zoomTo(targetZoom, null, false);
            });
        };

        this.props.onRef(this);
    }

    public viewResetHandle() {
        const tiledImage = this.viewer.world.getItemAt(0); // Assuming you just have a single image in the viewer
        const targetZoom = tiledImage.source.dimensions.x / this.viewer.viewport.getContainerSize().x;
        this.viewer.viewport.zoomTo(targetZoom, null, false);
    }

    public viewCloseHandle() {
        this.viewer.close();
        this.handleClose();
    }

    public handleClose() {
        this.props.handleClose(this.props.mountContainer);
    }

    public render() {
        return (
            <div id="v-lightBox" ref={this.lightBoxElementRef}>
                <div className="mask" onClick={this.handleClose}/>
                <div className="control-bar">
                    <span id={'light-box-image-zoom-in'}>in</span>
                    <span id={'light-box-image-zoom-out'}>out</span>
                    <span onClick={this.viewResetHandle}>reset</span>
                    <span onClick={this.viewCloseHandle}>close</span>
                </div>
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
