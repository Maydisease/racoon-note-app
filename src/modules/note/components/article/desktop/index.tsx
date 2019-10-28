import * as React from 'react';
import './desktop.scss';
import {Service}  from '../../../../../lib/master.electron.lib';

class DesktopComponent extends React.Component {

    public state: any = {
        memory  : {},
        cpu     : {},
        versions: {}
    };

    constructor(props: any) {
        super(props);
    }

    public getFileSize(size: number) {

        if (!size) {
            return "";
        }

        const num: number = 1024;

        if (size < num) {
            return size + "B";
        }

        if (size < Math.pow(num, 2)) {
            return (size / num).toFixed(2) + "K";
        }

        if (size < Math.pow(num, 3)) {
            return (size / Math.pow(num, 2)).toFixed(2) + "M";
        }

        if (size < Math.pow(num, 4)) {
            return (size / Math.pow(num, 3)).toFixed(2) + "G";
        }

        return (size / Math.pow(num, 4)).toFixed(2) + "T";
    }


    public getMemoryUsage() {
        setInterval(() => {
            const state            = this.state;
            const memoryUsage      = Service.Remote.process.memoryUsage();
            state.memory.external  = this.getFileSize(memoryUsage.external);
            state.memory.heapTotal = this.getFileSize(memoryUsage.heapTotal);
            state.memory.heapUsed  = this.getFileSize(memoryUsage.heapUsed);
            state.memory.rss       = this.getFileSize(memoryUsage.rss);
            this.setState(state);
        }, 1000);
    }

    public getCpuUsage() {
        console.log(Service.Remote.process.cpuUsage().system);
        setInterval(() => {
            const state      = this.state;
            const cpuUsage   = Service.Remote.process.cpuUsage();
            state.cpu.system = this.getFileSize(cpuUsage.system);
            state.cpu.user   = this.getFileSize(cpuUsage.user);
            this.setState(state);
        }, 1000);
    }

    public getSystemVersions() {
        console.log(666, Service.Remote.process.versions);
        const state             = this.state;
        const versions          = Service.Remote.process.versions;
        state.versions.electron = versions.electron;
        state.versions.node     = versions.node;
        state.versions.chrome   = versions.chrome;
        state.versions.openssl  = versions.openssl;
        state.versions.v8       = versions.v8;
        this.setState(state);
    }

    public componentDidMount(): void {
        // this.getMemoryUsage();
        // this.getCpuUsage();
        // this.getSystemVersions();
    }


    public render() {
        return (
            <div id="desktop">
                {/*<p>memory external: {this.state.memory.external}</p>*/}
                {/*<p>memory heapTotal: {this.state.memory.heapTotal}</p>*/}
                {/*<p>memory heapUsed: {this.state.memory.heapUsed}</p>*/}
                {/*<p>memory rss: {this.state.memory.rss}</p>*/}
                {/*<p>cpu system: {this.state.cpu.system}</p>*/}
                {/*<p>cpu user: {this.state.cpu.user}</p>*/}
                {/*<p>versions electron: {this.state.versions.electron}</p>*/}
                {/*<p>versions node: {this.state.versions.node}</p>*/}
                {/*<p>versions chrome: {this.state.versions.chrome}</p>*/}
                {/*<p>versions openssl: {this.state.versions.openssl}</p>*/}
                {/*<p>versions v8: {this.state.versions.v8}</p>*/}
            </div>
        );
    }
}

export default DesktopComponent;
