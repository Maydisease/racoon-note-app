import * as React from "react";
import './attached.scss';
import FinishList from './finish_list';
import ReadyList  from './ready_list';
import {Service}  from '../../../lib/master.electron.lib';

class Attached extends React.Component {

    public fileWhiteList: string[];

    public state: any = {
        isReadyTabStatus: false,
        readyUploadList : []
    };

    constructor(props: any) {
        super(props);
        this.fileWhiteList     = ['.jpg', '.jpeg', '.png', '.gif'];
        this.handleTabsSwitch  = this.handleTabsSwitch.bind(this);
        this.handleSelectFiles = this.handleSelectFiles.bind(this);
    }

    public handleTabsSwitch(readyTabStatus: boolean) {
        const state: any       = this.state;
        state.isReadyTabStatus = readyTabStatus;
        this.setState(state);
    }

    public handleSelectFiles() {
        const parentWin = Service.IPCRenderer.sendSync('getBrowserWindowList').master;
        const options   = {properties: ['openFile', 'multiSelections']};
        Service.SelectFiles(parentWin, options).then((files: any) => {
            const state: any      = this.state;
            state.readyUploadList = files;
            this.setState(state);
        });
    }

    public render() {
        return (
            <div id="attached-window">
                <div className="tabs-bar">
                    <div className="area-left">
                        <span onClick={this.handleTabsSwitch.bind(this, true)} className={`${this.state.isReadyTabStatus ? 'current' : ''}`}>ready</span>
                        <span onClick={this.handleTabsSwitch.bind(this, false)} className={`${this.state.isReadyTabStatus ? '' : 'current'}`}>finish</span>
                    </div>
                    <div className="area-right">
                        <button className="select" onClick={this.handleSelectFiles}>select</button>
                        <button className="upload disable">upload</button>
                    </div>
                </div>
                <div className="file-container">
                    {this.state.isReadyTabStatus ? <ReadyList readyUploadList={this.state.readyUploadList}/> : <FinishList/>}
                </div>
                <div className="status-bar"/>
            </div>
        )
    }
}

export default Attached;