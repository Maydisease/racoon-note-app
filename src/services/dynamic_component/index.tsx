import * as ReactDOM     from "react-dom";
import * as React        from "react";
import {Suspense}        from "react";
import {ObserverService} from '../observer.service';

export default class CommandController extends ObserverService {

    public mountElement: HTMLDivElement;
    public dynamicComponentRoot: HTMLDivElement;
    public dynamicContainerId: string;

    constructor() {
        super();
        this.dynamicContainerId = '#dynamic-container';
        this.destroy            = this.destroy.bind(this);
    }

    public init(tpl: Promise<any>, comData?: any) {
        const MountContainer      = React.lazy(() => import('./mount_container'));
        this.dynamicComponentRoot = document.body.querySelector(this.dynamicContainerId) as HTMLDivElement;
        this.mountElement         = document.createElement('div');
        this.mountElement.id      = 'mount_' + new Date().getTime().toString();
        this.mountElement.classList.add('mount-container');

        if (this.dynamicComponentRoot) {
            this.dynamicComponentRoot.appendChild(this.mountElement);
        }

        ReactDOM.render((
                <Suspense fallback={null}>
                    <MountContainer
                        destroy-self={this.destroy}
                        com-event={this.publish}
                        com-data={comData}
                        dynamic-tpl={tpl}
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
