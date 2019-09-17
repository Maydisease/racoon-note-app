import * as React from "react";
import './radio.scss';

class VRadio extends React.Component {

    public props: any = {
        selected: '',
        name    : ''
    };

    public element: React.RefObject<HTMLInputElement>;

    constructor(props: any) {
        super(props);
        this.props          = props;
        this.switchHeadless = this.switchHeadless.bind(this);
        this.element        = React.createRef();
    }

    public switchHeadless() {
        if (!this.props.disable) {
            const element = this.element.current as HTMLElement;
            let value     = Number(element.getAttribute('data-value') as string);
            value         = value === 0 ? 1 : 0;
            this.props.change(this.props.name, value);
            element.setAttribute('data-selected', value === 0 ? 'off' : 'on');
            element.setAttribute('data-value', `${value}`);
        }
    }

    public forceOff() {
        const element = this.element.current as HTMLElement;
        element.setAttribute('data-selected', 'off');
        element.setAttribute('data-value', '0');
        this.props.change(this.props.name, 0);
    }

    public shouldComponentUpdate(nextProps: any): boolean {
        if (!this.props.disable && nextProps.disable) {
            this.forceOff();
        }
        return true;
    }

    public render() {
        return (
            <div
                ref={this.element}
                className={`radio`}
                data-selected={this.props.selected === 1 ? 'on' : 'off'}
                data-value={this.props.selected}
                onClick={this.switchHeadless}
            >{this.props.title}</div>
        )
    }
}

export default VRadio;
