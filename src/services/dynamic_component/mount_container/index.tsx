import * as React from 'react';
import {ObserverEvent} from '../../observer.service'
import {ComponentClass, ComponentType} from 'react'

interface IProps {
	comData: any;
	destroySelf: () => void;
	comEvent: (event: ObserverEvent) => void;
	dynamicTpl: Promise<ComponentType | ComponentClass>
}

class MountContainer extends React.Component<IProps> {

	public props: any;

	constructor(props: any) {
		super(props);
		this.publish = this.publish.bind(this);
		this.destroySelf = this.destroySelf.bind(this);
	}

	public destroySelf() {
		this.props.destroySelf();
	}

	public publish(event: any) {
		this.props.comEvent(event);
	}

	public render() {
		const Component = React.lazy(() => this.props.dynamicTpl);
		return (<Component {...this.props.comData} destroySelf={this.destroySelf} comEvent={this.publish}/>);
	}
}

export default MountContainer;
