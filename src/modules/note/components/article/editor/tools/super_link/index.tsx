import * as React        from "react";
import './super_link.scss';
import {VMessageService} from "../../../../../../component/message";
import {storeSubscribe}  from "../../../../../../../store/middleware/storeActionEvent.middleware";

interface DefaultProps {
    mod: boolean
    handleConfirm: (title: string, link: string) => void
    handelCancel: () => void
    selectedTitle: string
}

interface DefaultState {
    from: {
        title: {
            value: string
        },
        link: {
            value: string
        }
    }
}

class SuperLinkComponent extends React.Component {

    public props: DefaultProps;
    public moveContainer: React.RefObject<HTMLDivElement>;
    public controlObject: React.RefObject<HTMLDivElement>;

    public state: DefaultState = {
        from: {
            title: {
                value: ''
            },
            link : {
                value: ''
            }
        }
    };

    constructor(props: any) {
        super(props);
        this.moveContainer = React.createRef();
        this.controlObject = React.createRef();
        this.handleChange  = this.handleChange.bind(this);
        this.confirm       = this.confirm.bind(this);
        this.cancel        = this.cancel.bind(this);
    }

    public componentDidMount(): void {

        const closest = (el: HTMLElement, selector: string): HTMLElement => {
            const matchesSelector = el.matches || el.webkitMatchesSelector;

            while (el) {
                if (matchesSelector.call(el, selector)) {
                    break;
                }
                el = el.parentElement as HTMLElement;
            }

            return el;
        };

        const dragObject        = this.moveContainer.current as HTMLDivElement;
        const controlObject     = this.controlObject.current as HTMLDivElement;
        const dragZone          = closest(dragObject, '.wrap.edit-mod') as HTMLDivElement;
        let moveStatus: boolean = false;

        controlObject.onmousedown = (e: MouseEvent): void => {

            moveStatus = true;

            const moveW: number          = dragObject.clientWidth;
            const moveH: number          = dragObject.clientHeight;
            const curDragObjectX: number = Number(dragObject.getAttribute('X'));
            const curDragObjectY: number = Number(dragObject.getAttribute('Y'));
            const dragZoneMaxW: number   = dragZone.clientWidth - moveW;
            const dragZoneMaxH: number   = dragZone.clientHeight - moveH;
            const dragObjectInDragZoneX  = e.layerX;
            const dragObjectInDragZoneY  = e.layerY;

            document.body.style.pointerEvents = 'none';

            document.onmousemove = (event: MouseEvent): void => {
                if (moveStatus) {

                    let X: number = 0;
                    let Y: number = 0;

                    X = event.offsetX - dragZone.offsetLeft - dragObjectInDragZoneX + curDragObjectX;
                    Y = event.offsetY - dragZone.offsetTop - dragObjectInDragZoneY + curDragObjectY;
                    X = X > 0 ? X : 0;
                    X = X < dragZoneMaxW ? X : dragZoneMaxW;
                    Y = Y > 0 ? Y : 0;
                    Y = Y < dragZoneMaxH ? Y : dragZoneMaxH;

                    dragObject.style.transform = 'translate(' + X + 'px, ' + Y + 'px)';
                    dragObject.setAttribute('X', String(X));
                    dragObject.setAttribute('Y', String(Y));

                }
            };

        };

        document.onmouseup = (): void => {
            moveStatus                        = false;
            document.body.style.pointerEvents = 'auto';
        };

        const initPos = () => {
            dragObject.style.display = 'block';
            const dragZoneW          = dragZone.clientWidth;
            const dragZoneH          = dragZone.clientHeight;
            const dragObjectW = dragObject.clientWidth;
            const dragObjectH = dragObject.clientHeight;
            const dragObjectX = dragZoneW / 2 - dragObjectW / 2;
            const dragObjectY = dragZoneH / 2 - dragObjectH / 2;

            dragObject.style.transform = 'translate(' + dragObjectX + 'px, ' + dragObjectY + 'px)';
            dragObject.setAttribute('X', String(dragObjectX));
            dragObject.setAttribute('Y', String(dragObjectY));

        };

        initPos();

        storeSubscribe('NOTE$CHANGE_EDITOR_COLUMN', (action: any) => {
            dragObject.style.display = 'none';
            setTimeout(() => {
                initPos();
            }, 0);

        });

    }

    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
    }

    public confirm() {
        const title = this.state.from.title.value;
        const link  = this.state.from.link.value;
        if (title.length > 0 && link.length > 0) {
            this.props.handleConfirm(title, link);
        } else {
            new VMessageService('title or link is not in the correct format', 'warning', 4000).init();
        }

    }

    public cancel() {
        this.props.handelCancel();
    }

    public render() {
        return (
            <div className="super-link-container" ref={this.moveContainer}>
                <div className="panel">
                    <div className="form-box" ref={this.controlObject}>
                        <div className="group">
                            <span>TITLE</span>
                            <input name="title" onChange={this.handleChange} type="text" placeholder="Enter link title..."/>
                        </div>
                        <div className="group">
                            <span>LINK</span>
                            <input name="link" onChange={this.handleChange} type="text" placeholder="Enter link url..."/>
                        </div>
                    </div>
                    <div className="border"/>
                    <div className="buttons">
                        <button onClick={this.cancel}>cancel</button>
                        <div className="split-line"/>
                        <button onClick={this.confirm}>confirm</button>
                    </div>
                </div>
            </div>
        );
    }
}

export default SuperLinkComponent
