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

    public drawMarkTimer: number;

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
            clearTimeout(this.drawMarkTimer);
            window.setTimeout(() => {
                this.drawMark();
            }, 200);
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
            this.drawElementVmContext.clearRect(0, 0, this.drawElementVm.width, this.drawElementVm.height);
        }
        setTimeout(() => {
            this.clearDraw();
            this.drawElementVm.width            = this.drawElementVm.clientWidth;
            this.drawElementVm.height           = this.drawElementVm.clientHeight;
            const listenElement                 = this.props.listenRef.current as HTMLDivElement;
            const listenRefScrollHeight         = listenElement.scrollHeight;
            const listenClientHeight            = listenElement.clientHeight;
            const lisentGetBoundingClientRect   = listenElement.getBoundingClientRect();
            let zoomRatio                       = listenClientHeight / listenRefScrollHeight;
            zoomRatio                           = Number(zoomRatio.toFixed(2));
            this.drawElementVmContext.fillStyle = "RGB(255, 0, 0, 1)";

            const markElements = listenElement.querySelectorAll('.sch-highlight');
            markElements.forEach((element: any) => {
                const y = element.getBoundingClientRect().top + listenElement.scrollTop - lisentGetBoundingClientRect.top;
                this.drawElementVmContext.fillRect(0, y * zoomRatio, this.drawElementVm.width, 1);
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
