import * as React from "react";
import './slider.scss';

interface ISliderProps {
    outValueType: 'value' | 'rate'
    countMark: number
    currentMark: number
    onDebug: boolean
    displayValue: boolean
    markChangeEvent?: (params: object) => any
    rangeMark: {
        min: number
        max: number
    }
}

interface ISliderState {
    onDebug: boolean
    slideBlock: {
        moveTo: number
        value: number
    }
}

class Slider extends React.Component<ISliderProps, ISliderState> {

    public moveContainerElementRef: React.RefObject<HTMLDivElement>;
    public moveBlockElementRef: React.RefObject<HTMLDivElement>;
    public moveContainerElement: HTMLDivElement;
    public moveBlockElement: HTMLDivElement;

    public state: ISliderState = {
        slideBlock: {
            moveTo: 0,
            value : 0,
        },
        onDebug   : false
    };

    public props: ISliderProps = {
        outValueType: 'rate',
        countMark   : 0,
        currentMark : 0,
        onDebug     : false,
        displayValue: false,
        rangeMark   : {
            min: 0,
            max: 0
        }
    };

    constructor(props: any) {
        super(props);
        this.props                   = props;
        this.moveContainerElementRef = React.createRef();
        this.moveBlockElementRef     = React.createRef();
    }

    public async componentDidMount() {

        let moveMin                         = 0;                                                        // 最小的可移动范围值
        let moveMax                         = 100;                                                      // 最大的可移动范围值
        let activeDocumentMoveFlag          = false;                                                    // Document是否可移动的Move标记
        this.moveContainerElement           = this.moveContainerElementRef.current as HTMLDivElement;   // 容器元素
        this.moveBlockElement               = this.moveBlockElementRef.current as HTMLDivElement;       // 滑块元素
        const moveContainerElementWidth     = this.moveContainerElement.clientWidth;                    // 容器的最大宽度
        const baseMoveRate                  = 100 / moveContainerElementWidth;                          // 默认的基准移动率
        const moveContainerElementBoundLeft = this.moveContainerElement.getBoundingClientRect().left;   // 当前组件离window容器的左距离
        const countMark                     = this.props.countMark || this.moveContainerElement.clientWidth;

        // 设置移动到指定位置
        const setMoveTo = (value: number, maxMoveValue: number) => {
            const newRate           = 100 / maxMoveValue;
            const moveTo            = !this.props.countMark ? value : newRate * value;
            const state             = this.state;
            const {min, max}        = this.props.rangeMark;
            state.slideBlock.moveTo = moveTo;
            state.slideBlock.value  = maxMoveValue * moveTo / 100;
            this.setState(state);

            if (!this.props.countMark) {
                moveMin = min;
                moveMax = max;
            } else {
                moveMin = min ? newRate * min : 0;
                moveMax = max ? newRate * max : 100;
            }
        };

        setMoveTo(this.props.currentMark, countMark);

        // 绑定滑块上的鼠标按下事件[处理]
        const listenSlideBlockMouseDownEventHandel = () => {
            activeDocumentMoveFlag = true;
            listenDocumentMouseUpEvent();
            listenDocumentMouseMoveEvent();
        };

        // 绑定滑块上的鼠标按下事件
        const listenSlideBlockMouseDownEvent = () => {
            this.moveBlockElement.addEventListener('mousedown', listenSlideBlockMouseDownEventHandel);
        };

        // 绑定document上的鼠标弹起事件
        const listenDocumentMouseUpEvent = () => {
            document.addEventListener('mouseup', listenDocumentMouseUpEventHandel);
        };

        // 绑定document上的鼠标弹起事件[处理]
        const listenDocumentMouseUpEventHandel = () => {
            activeDocumentMoveFlag = false;
            document.removeEventListener('mousemove', listenDocumentMouseMoveEventHandel);
            document.removeEventListener('mouseup', listenDocumentMouseUpEventHandel)

        };

        // 绑定document上的鼠标移动事件[处理]
        const listenDocumentMouseMoveEventHandel = (event: MouseEvent) => {
            if (!activeDocumentMoveFlag) {
                return;
            }

            const slideBlockPositionX = event.clientX - moveContainerElementBoundLeft;
            let moveTo                = baseMoveRate * slideBlockPositionX;
            moveTo                    = moveTo >= moveMax ? moveMax : moveTo <= moveMin ? moveMin : moveTo;
            const state               = this.state;
            state.slideBlock.moveTo   = moveTo;
            state.slideBlock.value    = countMark * moveTo / 100;
            this.setState(state);

            if (this.props.markChangeEvent) {
                this.props.markChangeEvent({...this.state.slideBlock});
            }
        };

        // 绑定document上的鼠标移动事件
        const listenDocumentMouseMoveEvent = () => {
            document.addEventListener('mousemove', listenDocumentMouseMoveEventHandel);
        };

        listenSlideBlockMouseDownEvent();
    }

    public render() {
        return (
            <div className={`widgets-slider`}>
                <div
                    ref={this.moveContainerElementRef}
                    className={`widgets-slider-wrap`}
                >
                    <div
                        className={`control-bar`}
                        style={{transform: `translateX(${-100 + this.state.slideBlock.moveTo}%)`}}
                    >
                        <div
                            ref={this.moveBlockElementRef}
                            className={`block`}
                        />
                    </div>
                </div>
                {this.props.displayValue ?
                    <div className={`out-value`}>{this.props.outValueType === 'rate' ? `${this.state.slideBlock.moveTo}%` : this.state.slideBlock.value}</div>
                    : null
                }
                {this.props.onDebug ?
                    <React.Fragment>
                        <p className={`display-value`}><span>countValue:</span> {this.props.countMark}</p>
                        <p className={`display-value`}><span>defaultValue:</span> {this.props.currentMark}</p>
                        <p className={`display-value`}><span>currentRate:</span> {this.state.slideBlock.moveTo}%</p>
                        <p className={`display-value`}><span>currentValue:</span> {this.state.slideBlock.value}</p>
                        <p className={`display-value`}><span>min:</span> {this.props.rangeMark.min} <span>max:</span> {this.props.rangeMark.max}</p>
                    </React.Fragment>
                    : null
                }

            </div>
        )
    }
}

export default Slider;
