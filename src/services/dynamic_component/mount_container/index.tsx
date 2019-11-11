import * as React from 'react';

class MountContainer extends React.Component {

    public props: any;

    constructor(props: any) {
        super(props);
        this.publish     = this.publish.bind(this);
        this.destroySelf = this.destroySelf.bind(this);
    }

    public destroySelf() {
        this.props['destroy-self']();
    }

    public publish(event: any) {
        this.props['com-event'](event);
    }

    public render() {
        const Component = React.lazy(() => this.props['dynamic-tpl']);
        return (<Component destroySelf={this.destroySelf} comEvent={this.publish}/>);
    }
}

export default MountContainer;
