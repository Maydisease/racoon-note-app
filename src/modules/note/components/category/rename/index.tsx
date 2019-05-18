import * as React    from "react";
import * as ReactDOM from "react-dom";
import './rename.scss';

class RenamePanel extends React.Component {

    public props: any = {
        pos : {
            x: 0,
            y: 0,
        },
        show: true
    };

    public state: any = {
        pos : {
            x: 0,
            y: 0,
        },
        from: {
            rename: {
                value: ''
            }
        },
        show: false
    };

    public myRef: any;

    public mountContainer: HTMLElement;

    constructor(props: any) {
        super(props);
        this.props            = props;
        this.myRef            = React.createRef();
        this.handleChange     = this.handleChange.bind(this);
        this.handleEnter      = this.handleEnter.bind(this);
        this.submitRename     = this.submitRename.bind(this);
        this.closeRenamePanel = this.closeRenamePanel.bind(this);
        this.resetInputValue  = this.resetInputValue.bind(this);
    }

    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
    }

    public handleEnter(event: any): void {
        if (event.keyCode === 27) {
            this.closeRenamePanel();
        }
        if (event.keyCode === 13) {
            this.submitRename();
        }
    }

    public resetInputValue() {
        const state             = this.state;
        state.from.rename.value = '';
        this.setState(state);
    }

    public closeRenamePanel() {
        this.props.cancelEvent();
        this.resetInputValue();
    }

    public submitRename() {
        this.props.confirmEvent(this.state.from.rename.value);
        this.resetInputValue();
    }

    public renderModalContent(props: any, mountContainer: HTMLElement) {
        const show = props.show;
        ReactDOM.render(
            <div id="v-renamePanel" className={`${show ? 'show' : ''}`} style={{top: this.props.pos.y}}>
                <div className="wrap">
                    <input
                        name="rename"
                        onKeyUp={this.handleEnter}
                        type="text"
                        value={this.state.from.rename.value}
                        placeholder={this.props.name}
                        onChange={this.handleChange} ref={this.myRef}
                    />
                    <div className="btn iconfont icon-selected" onClick={this.submitRename}/>
                </div>
            </div>,
            mountContainer
        );
        setTimeout(() => {
            this.myRef.current.focus();
        }, 200);
    }

    public componentDidUpdate(nextProps: any) {
        if (nextProps.pos.y !== this.state.pos.y) {
            this.renderModalContent(this.props, this.mountContainer);
        }
    }

    public componentDidMount() {
        const tempContainer     = document.createElement('div');
        tempContainer.className = 'body-component-container';
        document.body.appendChild(tempContainer);
        this.mountContainer = tempContainer;
        this.renderModalContent(this.props, this.mountContainer);
        window.addEventListener('click', (event: Event) => {
            if (this.props.show) {
                let isSelf = false;
                (event as any).path.some((el: any) => {
                    if (el.id === 'v-renamePanel') {
                        isSelf = true;
                    }
                });

                if (!isSelf) {
                    this.closeRenamePanel();
                }
            }
        });
    }

    public render() {
        return (null)
    }
}

export default RenamePanel;
