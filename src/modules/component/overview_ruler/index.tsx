import * as React       from 'react';
import './overviewRuler.scss';
import {storeSubscribe} from "../../../store/middleware/storeActionEvent.middleware";

interface DefaultProps {
    listenRef: React.RefObject<HTMLDivElement>;
}

class OverviewRuler extends React.Component {

    public drawElementRef: React.RefObject<HTMLCanvasElement>;
    public drawElementVm: HTMLCanvasElement;
    public drawElementVmContext: CanvasRenderingContext2D;

    public props: DefaultProps;

    constructor(props: any) {
        super(props);
        this.drawElementRef = React.createRef();
        this.drawMark       = this.drawMark.bind(this);
        this.clearDraw      = this.clearDraw.bind(this);
    }

    public componentDidMount() {

        if (this.drawElementVmContext) {
            this.clearDraw();
        } else {
            this.drawMark();
        }

        storeSubscribe('NOTE$QUICK_SEARCH', (action: any) => {
            this.drawMark();
        });

        storeSubscribe('NOTE$UN_SEARCH_TAG', (action: any) => {
            this.clearDraw();
        });

        window.onresize = () => {
            this.drawMark();
        }

    }

    public clearDraw() {
        if (this.drawElementVmContext) {
            this.drawElementVmContext.clearRect(0, 0, this.drawElementVm.width, this.drawElementVm.height);
        }
    }

    public drawMark() {

        if (!this.drawElementVmContext) {
            this.drawElementVm        = this.drawElementRef.current as HTMLCanvasElement;
            this.drawElementVmContext = this.drawElementVm.getContext("2d") as CanvasRenderingContext2D;
        }

        this.drawElementVm.width            = this.drawElementVm.clientWidth;
        this.drawElementVm.height           = this.drawElementVm.clientHeight;
        const listenElement                 = this.props.listenRef.current as HTMLDivElement;
        const listenRefScrollHeight         = listenElement.scrollHeight;
        const listenClientHeight            = listenElement.clientHeight;
        let zoomRatio                       = listenClientHeight / listenRefScrollHeight;
        zoomRatio                           = Number(zoomRatio.toFixed(2));
        this.drawElementVmContext.fillStyle = "RGB(255, 0, 0, 1)";
        setTimeout(() => {
            const markElements = listenElement.querySelectorAll('.sch-highlight');
            markElements.forEach((element: any) => {
                this.drawElementVmContext.fillRect(0, element.offsetTop * zoomRatio, this.drawElementVm.width, 1);
            })
        });

    }

    public render() {
        return (
            <canvas id="overview-ruler" ref={this.drawElementRef}/>
        )
    }
}

export default OverviewRuler;
