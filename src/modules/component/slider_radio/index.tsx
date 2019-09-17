import * as React from "react";
import './slider_radio.scss';

class SliderRadio extends React.Component {

    public state: any = {
        displayState: 1
    };

    public props: any = {
        items: []
    };

    constructor(props: any) {
        super(props);
        this.props = props;
    }

    public switchHeadless(displayState: number) {
        const state        = this.state;
        state.displayState = displayState;
        this.setState(state);
        this.props.change(displayState);
    }

    public render() {
        return (
            <div className={`switch type-${this.state.displayState}`}>
                <label>
                    {
                        this.props.items &&
                        this.props.items.map((item: string, index: number) => {
                            return (
                                <span
                                    key={index}
                                    className={(index + 1) === this.state.displayState ? 'active' : ''}
                                    onClick={this.switchHeadless.bind(this, index + 1)}
                                >{item}</span>
                            )
                        })
                    }
                    <span className={`side-block`}/>
                </label>
            </div>
        )
    }
}

export default SliderRadio;
