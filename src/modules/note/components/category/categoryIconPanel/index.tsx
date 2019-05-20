import * as React    from "react";
import * as ReactDOM from "react-dom";
import './category_icon_panel.scss';
import {iconsMaps}   from '../../../../component/icons/icons';

class CategoryIconPanel extends React.Component {

    public props: any = {
        pos : {
            x: 0,
            y: 0,
        },
        show: true
    };

    public state: any = {
        pos    : {
            x: 0,
            y: 0,
        },
        show   : false,
        curIcon: ''
    };

    public myRef: any;

    public mountContainer: HTMLElement;

    constructor(props: any) {
        super(props);
        this.props          = props;
        this.myRef          = React.createRef();
        this.changeIcon     = this.changeIcon.bind(this);
        this.closeIconPanel = this.closeIconPanel.bind(this);
    }

    public closeIconPanel() {
        const state   = this.state;
        state.curIcon = '';
        this.setState(state);
        this.props.cancelEvent();
    }

    public changeIcon(item: string): void {
        const state   = this.state;
        state.curIcon = item;
        this.setState(state);
        this.props.changeIconEvent({icon: item});
    }

    public renderModalContent(props: any, mountContainer: HTMLElement) {
        const show    = props.show;
        const x       = Number(this.props.pos.x || 0);
        let y         = Number(this.props.pos.y || 0);
        let isReverse = false;

        // 判断展示的面板高度，当前视口是否能容纳的下，若无法容纳，则反向展示
        if (y + 260 > document.body.clientHeight) {
            y         = y - 200;
            isReverse = true;
        }

        ReactDOM.render(
            <div id="v-changeCategoryIconPanel" className={`${show ? 'show' : ''} ${isReverse ? 'reverse' : ''}`} style={{top: y + 38, left: x - 20}}>
                <div className="wrap">
                    {
                        iconsMaps.map((item: string) => {
                            return (
                                <img
                                    key={item}
                                    onClick={this.changeIcon.bind(this, item)}
                                    className={`${(this.state.curIcon || this.props.defaultIcon) === item ? 'current' : ''}`}
                                    src={require(`../../../../../statics/common/images/svg/${item}.svg`)}
                                />
                            );
                        })
                    }
                </div>
            </div>,
            mountContainer
        );
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
                    if (el.id === 'v-changeCategoryIconPanel') {
                        isSelf = true;
                    }
                });

                if (!isSelf) {
                    this.closeIconPanel();
                }
            }
        });

    }

    public render() {
        return (null)
    }
}

export default CategoryIconPanel;
