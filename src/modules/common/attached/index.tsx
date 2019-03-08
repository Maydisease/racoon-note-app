import * as React from "react";
import './attached.scss';
import FinishList from './finish_list';
import ReadyList  from './ready_list';
import {Service}  from '../../../lib/master.electron.lib';

class Attached extends React.Component {

    public fileWhiteList: string[];

    public state: any = {
        isReadyTabStatus: true,
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
            if (typeof files === 'object' && files.length > 0) {
                const state: any    = this.state;
                const newFiles: any = [];
                files.forEach((file: any) => {
                    if (state.readyUploadList.findIndex((item: any) => item.path === file.path) < 0) {
                        file.status = false;
                        newFiles.push(file);
                    }
                });
                state.readyUploadList = [...state.readyUploadList, ...newFiles];
                this.setState(state);
            }
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
                    <div className="area-right" style={{display: this.state.isReadyTabStatus ? 'block' : 'none'}}>
                        <button className="select" onClick={this.handleSelectFiles}>select</button>
                        <button className={`upload ${this.state.readyUploadList.length > 0 ? '' : 'disable'}`}>upload</button>
                    </div>
                </div>
                <div className="file-container" style={{display: this.state.isReadyTabStatus ? 'block' : 'none'}}>
                    <ReadyList readyUploadList={this.state.readyUploadList}/>
                </div>
                <div className="file-container" style={{display: this.state.isReadyTabStatus ? 'none' : 'block'}}>
                    <FinishList/>
                </div>
                <div className="status-bar"/>
            </div>
        )
    }
}

export default Attached;