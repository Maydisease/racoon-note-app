import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import * as React        from "react";
import {request}         from "../../note/services/requst.service";
import {Service}         from "../../../lib/master.electron.lib";
import {VLoadingService} from "../../component/loading";

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

        let loading: VLoadingService | undefined;

        if (loading) {
            loading.destroy();
        }

        loading = new VLoadingService({});
        loading.init();

        const response = await request('attached', 'getAttachedData');
        if (response.result !== 1) {
            const state              = this.state;
            state.finishAttachedList = response.data;
            this.setState(state as any);
            loading.destroy();
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
            }
        ).then(async (result: any) => {
            const btnIndex: number = result.response;
            // btn 按钮被点击，删除被选中的Note
            if (btnIndex === 0) {
                const response = await request('attached', 'removeAttached', {ids: [id]});
                if (response.result !== 1) {
                    await this.getAttachedData();
                }
            }
        });
    }

    public handleClickImage(name: string, path: string) {
        const data = {
            imageTitle: name,
            imageUrl  : `racoon://img/${path}`
        };

        Service.RenderToRender.emit('master@editorInsertImage', {emitAuthor: 'attached', data});
    }

    public render() {
        return (
            <div className="file-list finishList">
                <div className="image-container-list">
                    {
                        this.state.finishAttachedList.map((item: any, index: number) => {
                            return (
                                <div className="image-item" key={index}>
                                    <div className="image-box" onClick={this.handleClickImage.bind(this, item.name, item.path)}>
                                        <img src={`racoon://img/${item.path}`}/>
                                    </div>
                                    <div className="image-text">
                                        <span className="name">{item.name}</span>
                                        <label onClick={this.removeLi.bind(this, item.id)}><FontAwesomeIcon className="fa-icon left" icon="trash"/></label>
                                    </div>

                                    {/*<span className="type">{item.type}</span>*/}
                                    {/*<span className="size">{utils.bytesToSize(item.size)}</span>*/}
                                    {/*<span className="action">*/}
                                    {/*<label onClick={this.removeLi.bind(this, item.id)}><FontAwesomeIcon className="fa-icon left" icon="trash"/></label>*/}
                                    {/*</span>*/}
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        )
    }
}

export default FinishList;
