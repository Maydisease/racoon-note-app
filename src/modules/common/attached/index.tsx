import * as React from "react";
import './attached.scss';
import FinishList from './finish_list';
import ReadyList  from './ready_list';
import {Service}  from '../../../lib/master.electron.lib';

class Attached extends React.Component {

    public fileWhiteList: string[];

    public state: any = {
        isReadyTabStatus : false,
        readyUploadList  : [],
        globalUploadState: 0 // <-- 0=初始状态，1=上传中, 2=全部上传完毕
    };

    constructor(props: any) {
        super(props);
        this.fileWhiteList              = ['.jpg', '.jpeg', '.png', '.gif'];
        this.handleTabsSwitch           = this.handleTabsSwitch.bind(this);
        this.handleSelectFiles          = this.handleSelectFiles.bind(this);
        this.handleReadyListRemoveEvent = this.handleReadyListRemoveEvent.bind(this);
        this.handleUploadFiles          = this.handleUploadFiles.bind(this);
    }

    public handleTabsSwitch(readyTabStatus: boolean) {
        const state: any       = this.state;
        state.isReadyTabStatus = readyTabStatus;
        this.setState(state);
    }

    public handleReadyListRemoveEvent(item: any) {
        const state = this.state;
        const index = state.readyUploadList.findIndex((sourceItem: any) => sourceItem.path === item.path);
        state.readyUploadList.splice(index, index + 1);
        this.setState(state);
    }

    // 选择文件
    public handleSelectFiles() {

        const parentWin = Service.IPCRenderer.sendSync('getBrowserWindowList').master;
        const options   = {
            properties: ['openFile', 'multiSelections'],
            filters: [
                { name: 'Images', extensions: ['jpg', 'png', 'gif'] }
            ]
        };

        Service.SelectFiles(parentWin, options).then((files: any) => {
            if (typeof files === 'object' && files.length > 0) {
                const state: any    = this.state;
                const newFiles: any = [];
                files.forEach((file: any) => {
                    if (state.readyUploadList.findIndex((item: any) => item.path === file.path) < 0) {
                        file.status = 0;
                        newFiles.push(file);
                    }
                });
                state.readyUploadList = [...state.readyUploadList, ...newFiles];
                this.setState(state);
            }
        });

    }

    // 上传文件
    public async handleUploadFiles() {

        // 预上传的文件个数
        let uploadLen = 0;

        this.state.readyUploadList.forEach(async (item: any, index: number) => {
            if (item.status === 0) {

                uploadLen++;

                const state                           = this.state;
                const itemKey                         = state.readyUploadList.findIndex((sourceItem: any) => sourceItem.path === item.path);
                state.readyUploadList[itemKey].status = 1;
                state.globalUploadState               = 1;
                const response                        = await new Service.ServerProxyUpload('attached', 'upload', item).send();

                // 上传成功
                if (response.result === 0) {
                    state.readyUploadList[itemKey].status = 2;
                    state.globalUploadState               = uploadLen === this.state.readyUploadList.length ? 2 : 1;
                }
                // 上传失败
                else {
                    state.globalUploadState               = uploadLen === this.state.readyUploadList.length ? 0 : 1;
                    state.readyUploadList[itemKey].status = 3;
                }

                this.setState(state);
            }
        });
    }

    public render() {
        return (
            <div id="attached-window">
                <div className="tabs-bar">
                    <div className="area-left">
                        <span onClick={this.handleTabsSwitch.bind(this, false)} className={`${this.state.isReadyTabStatus ? '' : 'current'}`}>finish</span>
                        <span onClick={this.handleTabsSwitch.bind(this, true)} className={`${this.state.isReadyTabStatus ? 'current' : ''}`}>ready</span>
                    </div>
                    <div className="area-right" style={{display: this.state.isReadyTabStatus ? 'block' : 'none'}}>
                        <button
                            className={`select ${this.state.globalUploadState === 1 ? 'disable' : ''}`} onClick={this.handleSelectFiles}
                        >select
                        </button>
                        <button
                            className={`upload ${(this.state.readyUploadList.length <= 0) || (this.state.globalUploadState === 1) ? 'disable' : ''}`}
                            onClick={this.handleUploadFiles}
                        >upload
                        </button>
                    </div>
                </div>
                <div className="file-container" style={{display: this.state.isReadyTabStatus ? 'block' : 'none'}}>
                    <ReadyList readyListRemoveEvent={this.handleReadyListRemoveEvent} readyUploadList={this.state.readyUploadList}/>
                </div>
                {
                    !this.state.isReadyTabStatus ?
                        <div className="file-container">
                            <FinishList/>
                        </div>
                        :
                        null
                }
                {/*<div className="status-bar">*/}
                {/*<span>ready: <em>2</em></span>*/}
                {/*<span>upload: <em>2</em></span>*/}
                {/*<span>finish: <em>2</em></span>*/}
                {/*<span>count: <em>6</em></span>*/}
                {/*</div>*/}
            </div>
        )
    }
}

export default Attached;