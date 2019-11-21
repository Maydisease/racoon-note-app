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
        setInterval(() => {
            const state      = this.state;
            const cpuUsage   = Service.Remote.process.cpuUsage();
            state.cpu.system = this.getFileSize(cpuUsage.system);
            state.cpu.user   = this.getFileSize(cpuUsage.user);
            this.setState(state);
        }, 1000);
    }

    public getSystemVersions() {
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
        this.getSystemVersions();
    }


    public render() {
        return (
            <div id="desktop">
                <div className="center">
                    <div className="keyboard">
                        <div className="col left">
                            <h4>Global</h4>
                            <p>
                                <span className="key">Focus Quick Search</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>F</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Open Search Panel</span>
                                <span className="value">
                                    <em>⇧</em>
                                    <em>⌘</em>
                                    <em>F</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Open Trash Box</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>T</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Switch Editor Mode</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>E</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Full Size Edit/Preview</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>W</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Open Network Monitor</span>
                                <span className="value">
                                    <em>⇧</em>
                                    <em>⌘</em>
                                    <em>N</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Open Boot Monitor</span>
                                <span className="value">
                                    <em>⇧</em>
                                    <em>⌘</em>
                                    <em>B</em>
                                </span>
                            </p>
                            <h4>Editor</h4>
                            <p>
                                <span className="key">Editor Search</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>F</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Save Note</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>S</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Copy</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>C</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Paste</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>V</em>
                                </span>
                            </p>
                            <p>
                                <span className="key">Cut</span>
                                <span className="value">
                                    <em>⌘</em>
                                    <em>X</em>
                                </span>
                            </p>
                        </div>
                        <div className="col right">
                            <h4>Version</h4>
                            <p>
                                <span className="key">v8</span>
                                <span className="value">{this.state.versions.v8}</span>
                            </p>
                            <p>
                                <span className="key">nodejs</span>
                                <span className="value">{this.state.versions.node}</span>
                            </p>
                            <p>
                                <span className="key">chrome</span>
                                <span className="value">{this.state.versions.chrome}</span>
                            </p>
                            <p>
                                <span className="key">openssl</span>
                                <span className="value">{this.state.versions.openssl}</span>
                            </p>
                            <p>
                                <span className="key">electron</span>
                                <span className="value">{this.state.versions.electron}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default DesktopComponent;
