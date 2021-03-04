import * as ReactDOM from 'react-dom';
import * as React from 'react';
import {ComponentType, Suspense} from 'react';
import {ObserverService} from '../observer.service';

export default class CommandController extends ObserverService {

	public mountElement: HTMLDivElement;
	public dynamicComponentRoot: HTMLDivElement;
	public dynamicContainerId: string;

	constructor() {
		super();
		this.dynamicContainerId = '#dynamic-container';
		this.destroy = this.destroy.bind(this);
	}

	public async init(tpl: Promise<ComponentType>, comData?: any) {
		const MountContainer = await React.lazy(() => import('./mount_container'));
		this.dynamicComponentRoot = document.body.querySelector(this.dynamicContainerId) as HTMLDivElement;
		this.mountElement = document.createElement('div');
		this.mountElement.id = 'mount_' + new Date().getTime().toString();
		this.mountElement.classList.add('mount-container');

		if (this.dynamicComponentRoot) {
			this.dynamicComponentRoot.appendChild(this.mountElement);
		} else {
			this.dynamicComponentRoot = document.createElement('div');
			this.dynamicComponentRoot.id = this.dynamicContainerId;
			this.dynamicComponentRoot.appendChild(this.mountElement)
			document.body.appendChild(this.dynamicComponentRoot);
		}

		ReactDOM.render((
				<Suspense fallback={null}>
					<MountContainer
						destroySelf={this.destroy}
						comEvent={this.publish}
						comData={comData}
						dynamicTpl={tpl}
					/>
				</Suspense>
			), this.mountElement
		);
	}

	public destroy() {
		ReactDOM.unmountComponentAtNode(this.mountElement);
		this.dynamicComponentRoot.removeChild(this.mountElement);
	}
}
