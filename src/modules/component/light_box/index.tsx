import './light_box.scss';
import * as ReactDOM     from "react-dom";
import * as React        from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const openseadragon = require('openseadragon');

class Component extends React.Component {

    public lightBoxElementRef: React.RefObject<HTMLDivElement>;
    public viewer: any;
    public isZoomAnimationFinish: boolean = false;

    public state: any = {
        zoom: {
            rate              : 0,    // 单次缩放率
            defaultSourceRate : 0,    // 初始化时的缩放率
            currentLevel      : 100,  // 当前缩放级别（%）
            currentRate       : 0,    // 当前缩放率
            intervalLevel     : 25,   // 缩放间隔
            isImageGtContainer: false // 图片是否超过容器大小
        }
    };

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

    public viewerInit() {
        const imageElement  = new Image();
        imageElement.src    = this.props.imageUrl;
        imageElement.onload = () => {
            const lightBoxElement = this.lightBoxElementRef.current;
            this.viewer           = openseadragon({
                element                  : lightBoxElement,
                tileSources              : {
                    type     : 'image',
                    prefixUrl: 'canvasImageDrag',
                    url      : this.props.imageUrl,
                    size     : {
                        width : imageElement.width,
                        height: imageElement.height
                    }
                },
                gestureSettingsMouse     : {
                    pinchToZoom   : false,
                    dblClickToZoom: false,
                    dragToPan     : false,
                    clickToZoom   : false,
                    scrollToZoom  : false,
                    zoomToRefPoint: false,
                },
                gestureSettingsTouch     : {
                    pinchToZoom   : false,
                    dblClickToZoom: false,
                    dragToPan     : false,
                    clickToZoom   : false,
                    scrollToZoom  : false,
                    zoomToRefPoint: false
                },
                debugMode                : false,
                autoHideControls         : true,
                autoResize               : true,
                preserveImageSizeOnResize: true,
                defaultZoomLevel         : 1,
                zoomInButton             : "x",
                zoomOutButton            : "x",
                visibilityRatio          : .5,
                homeFillsViewer          : true
            });

            // 滚轮事件
            this.viewer.addHandler('canvas-scroll', (scrollEvent: any) => {
                const type = scrollEvent.scroll === -1 ? 'out' : 'in';
                this.viewZoomHandle(type);
            });

            // canvas绘布点击事件
            this.viewer.addHandler('canvas-click', (scrollEvent: any) => {
                this.viewZoomHandle('none', true);
            });

            // canvas拖拽事件
            this.viewer.addHandler('canvas-drag-end', (scrollEvent: any) => {
                this.viewZoomHandle('none', true);
            });

            // viewer 容器大小改变事件
            this.viewer.addHandler('resize', (scrollEvent: any) => {
                this.viewCloseHandle();
            });

            // 当viewer 容器加载图片后被创建的事件
            this.viewer.addHandler('open', (v: any) => {
                this.viewResetHandle();
            });
        };
    }

    public componentDidMount() {
        this.viewerInit();
        this.props.onRef(this);
    }

    // 缩放处理
    public viewZoomHandle(type: string, immediately: boolean = false): void | boolean {

        const state        = this.state;
        let currentZoomNum = this.state.zoom.currentRate;
        let minZoomLevel   = 100;
        let maxZoomLevel   = 300;

        if (state.zoom.isImageGtContainer) {
            minZoomLevel = 50;
            maxZoomLevel = 300;
        }

        switch (type) {
            case 'in':
                // 放大约束
                if (state.zoom.currentLevel + this.state.zoom.intervalLevel <= maxZoomLevel) {
                    currentZoomNum += this.state.zoom.rate;
                    state.zoom.currentLevel += this.state.zoom.intervalLevel
                }
                break;
            case 'out':
                // 缩小约束
                if (state.zoom.currentLevel - this.state.zoom.intervalLevel >= minZoomLevel) {
                    currentZoomNum -= this.state.zoom.rate;
                    state.zoom.currentLevel -= this.state.zoom.intervalLevel;
                }
                break;
        }

        currentZoomNum         = Math.floor(currentZoomNum);
        state.zoom.currentRate = currentZoomNum;
        this.setState(state);

        this.viewer.viewport.zoomTo(currentZoomNum / 1000000, null, immediately);
        const {x, y} = this.viewer.viewport.getHomeBounds().getCenter();
        this.viewer.viewport.panTo(new openseadragon.Point(x, y))
    }

    // 重置缩放
    public viewResetHandle(immediately: boolean = true) {
        const state                   = this.state;
        const tiledImage              = this.viewer.world.getItemAt(0);
        const imageWidth              = tiledImage.source.dimensions.x;
        const imageHeight             = tiledImage.source.dimensions.y;
        const containerWidth          = this.viewer.viewport.getContainerSize().x;
        const containerHeight         = this.viewer.viewport.getContainerSize().y;
        state.zoom.isImageGtContainer = (imageWidth >= containerWidth) || (imageHeight >= containerHeight);
        let targetZoom                = Math.floor(imageWidth / containerWidth * 1000000);
        state.zoom.rate               = Math.floor(targetZoom / 100 * this.state.zoom.intervalLevel);
        state.zoom.currentLevel       = 100;

        // 如果图片尺寸大于容器尺寸
        if (state.zoom.isImageGtContainer) {
            targetZoom              = targetZoom / 5;
            state.zoom.currentLevel = 50;
        }

        state.zoom.defaultSourceRate = targetZoom;
        state.zoom.currentRate       = targetZoom;
        this.setState(state);
        this.viewer.viewport.zoomTo(targetZoom / 1000000, null, immediately);
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
                    <span onClick={this.viewZoomHandle.bind(this, 'in', false)}>
                        <FontAwesomeIcon className="clearSearchKey fa-icon" icon="search-plus"/>
                    </span>
                    <span onClick={this.viewZoomHandle.bind(this, 'out', false)}>
                        <FontAwesomeIcon className="clearSearchKey fa-icon" icon="search-minus"/>
                    </span>
                    <span onClick={this.viewResetHandle.bind(this, false)}>
                        <FontAwesomeIcon className="clearSearchKey fa-icon" icon="window-restore"/>
                    </span>
                    <span>{this.state.zoom.currentLevel}%</span>
                    <span onClick={this.viewCloseHandle}>
                        <FontAwesomeIcon className="clearSearchKey fa-icon" icon="window-close"/>
                    </span>
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
