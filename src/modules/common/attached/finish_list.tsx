import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as React        from "react";
import {Service}         from "../../../lib/master.electron.lib";
import {utils}           from "../../../utils";

class FinishList extends React.Component {

    public state = {
        finishAttachedList: []
    };

    constructor(props: any) {
        super(props);
        this.removeLi = this.removeLi.bind(this);
    }

    public async componentDidMount() {
        await this.getAttachedData();
    }

    public async getAttachedData() {

        const response = await new Service.ServerProxy('attached', 'getAttachedData').send();
        if (response.result !== 1) {
            const state              = this.state;
            state.finishAttachedList = response.data;
            this.setState(state);
        }

    }

    public async removeLi(id: number) {
        Service.Dialog.showMessageBox({
                title    : 'Delete this file',
                type     : 'question',
                message  : 'Delete this file',
                detail   : 'Do you really want to delete this file?',
                defaultId: 0,
                cancelId : 1,
                buttons  : ['Yes', 'Cancel']
            },
            // btn 按钮被点击，删除被选中的Note
            async (btnIndex: number) => {
                if (btnIndex === 0) {
                    const response = await new Service.ServerProxy('attached', 'removeAttached', {ids: [id]}).send();

                    if (response.result !== 1) {
                        const state = this.state;
                        const index = state.finishAttachedList.findIndex((sourceItem: any) => sourceItem.id === id);
                        state.finishAttachedList.splice(index, index + 1);
                        this.setState(state);
                    }
                }
            }
        );
    }

    public render() {
        return (
            <div className="file-list finishList">
                <ul className="sort">
                    <li>
                        <span className="name">name</span>
                        <span className="type">type</span>
                        <span className="size">size</span>
                        <span className="action"/>
                    </li>
                </ul>
                <ul className="list">
                    {
                        this.state.finishAttachedList.map((item: any, index: number) => {
                            return (
                                <li key={index}>
                                    <span className="name">{item.name}</span>
                                    <span className="type">{item.type}</span>
                                    <span className="size">{utils.bytesToSize(item.size)}</span>
                                    <span className="action">
                                        <label onClick={this.removeLi.bind(this, item.id)}><FontAwesomeIcon className="fa-icon left" icon="trash"/></label>
                                    </span>
                                </li>
                            );
                        })
                    }
                </ul>
            </div>
        )
    }
}

export default FinishList;