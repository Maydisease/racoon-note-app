import './dynamicTpl.scss';
import * as React from 'react';

class DynamicTpl extends React.Component {

    public props: any;

    constructor(props: any) {
        super(props);
        this.close = this.close.bind(this);
    }

    public componentDidMount(): void {
        console.log('ComB is init', this.props);
    }

    public close() {
        this.props.destroySelf();
    }

    public render() {
        return (
            <div className="comA" onClick={this.close}>comB!</div>
        );
    }
}

export default DynamicTpl;
