import * as React from "react";
import './user_options.scss';
import Slider     from "../../component/widgets/slider";
import {Service}  from "../../../lib/master.electron.lib";

class UserOptions extends React.Component {

    public userOptionsForm = {
        view: {
            viewContentWidth: 0
        }
    };

    constructor(props: any) {
        super(props);
        this.markChangeEvent   = this.markChangeEvent.bind(this);
        this.updateUserOptions = this.updateUserOptions.bind(this);
    }

    public markChangeEvent(params: { moveTo: number, value: number }) {
        this.userOptionsForm.view.viewContentWidth = params.moveTo;
        Service.RenderToRender.emit('master@userOptionsViewContentWidthChange', {emitAuthor: 'userOptions', ...params});
    }

    public componentDidMount(): void {
        // Service.RenderToRender.emit('master@userOptionsViewContentWidthChange', {emitAuthor: 'userOptions'});
    }

    public async updateUserOptions() {
        console.log('---');
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
                        <button onClick={this.updateUserOptions}>Update</button>
                    </div>
                    <div className={'form-container'}>
                        <div className={'group'}>
                            <div className={'field-name'}>View Content Width</div>
                            <div className={'field-value'}>
                                <Slider
                                    countMark={0}
                                    currentMark={100}
                                    outValueType={`rate`}
                                    onDebug={false}
                                    displayValue={true}
                                    rangeMark={{min: 70, max: 100}}
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
