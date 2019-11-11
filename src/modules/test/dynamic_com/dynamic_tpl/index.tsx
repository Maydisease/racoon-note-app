import './dynamicTpl.scss';
import * as React from 'react';

class DynamicTpl extends React.Component {

    public props: any;

    constructor(props: any) {
        super(props);
        this.close = this.close.bind(this);
    }

    public componentDidMount(): void {
        console.log('ComA is init', this.props);
    }

    public close() {
        this.props.destroySelf();
        this.props.comEvent({name: 'ok'});
    }

    public componentWillUnmount() {
        console.log('componentWillUnmount');
    }

    public render() {
        return (
            <div className="comA" onClick={this.close}>comA!</div>
        );
    }
}

export default DynamicTpl;
