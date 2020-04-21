import * as React from "react";
import './user_options.scss';
import Slider     from "../../component/widgets/slider";
import {Service}  from "../../../lib/master.electron.lib";

class UserOptions extends React.Component {

    public fileWhiteList: string[];

    public state: any = {
        isReadyTabStatus : false,
        readyUploadList  : [],
        globalUploadState: 0 // <-- 0=初始状态，1=上传中, 2=全部上传完毕
    };

    constructor(props: any) {
        super(props);
        this.markChangeEvent = this.markChangeEvent.bind(this);
    }

    public markChangeEvent(params: object) {
        Service.RenderToRender.emit('master@userOptionsViewContentWidthChange', {emitAuthor: 'userOptions', ...params});
    }

    public componentDidMount(): void {
        // Service.RenderToRender.emit('master@userOptionsViewContentWidthChange', {emitAuthor: 'userOptions'});
    }

    public render() {
        return (
            <div id="user-options-window">
                <div className={'sidebar'}>
                    <ul>
                        <li>View</li>
                        <li>Edit</li>
                    </ul>
                </div>
                <div className={'main'}>
                    <div className={'action-bar'}>
                        <button>Update</button>
                    </div>
                    <div className={'form-container'}>
                        <div className={'group'}>
                            <div className={'field-name'}>View Content Width</div>
                            <div className={'field-value'}>
                                <Slider
                                    countMark={0}
                                    currentMark={50}
                                    outValueType={`rate`}
                                    onDebug={false}
                                    displayValue={true}
                                    rangeMark={{min: 50, max: 100}}
                                    markChangeEvent={this.markChangeEvent}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default UserOptions;
