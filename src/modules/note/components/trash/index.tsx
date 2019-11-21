import * as React        from 'react';
import './trashArticle.scss';
import {store}           from "../../../../store";
import {request}         from "../../services/requst.service";
import {Service}         from "../../../../lib/master.electron.lib";
import {VMessageService} from "../../../component/message";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

interface KeyboardState {
    leftShift: boolean;
}

class TrashArticle extends React.Component {

    public contextMenu: any;
    public keyboard: KeyboardState;

    public state: any = {
        trashArticleList        : [],
        trashArticleSelectedMaps: {},
        trashArticleDetail      : {},
        contextMenu             : '',
    };

    constructor(props: any) {
        super(props);
        this.contextMenu = new Service.Menu();
        this.contextMenuInit();
        this.actionCrush           = this.actionCrush.bind(this);
        this.actionRestore         = this.actionRestore.bind(this);
        this.handleItemContextMenu = this.handleItemContextMenu.bind(this);
        this.keyboard              = {leftShift: false}
    }

    // contextMenu初始化
    public contextMenuInit() {
        const $this: this = this;

        // item[0];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'C',
            label      : 'Crush', click() {
                $this.actionCrush()
            }
        }));

        this.contextMenu.append(new Service.MenuItem({type: 'separator'}));

        // item[1];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'R',
            label      : 'Restore', click() {
                $this.actionRestore()
            }
        }));
    }

    public handleItemContextMenu(id: number) {
        this.itemSelectedHandel(id);
        this.contextMenu.popup({window: Service.getWindow('master')});
    }

    // 初始化当前的trashArticleDetail对象
    public async initTrashArticleDetail() {
        const state              = this.state;
        state.trashArticleDetail = {
            id          : 0,
            cid         : null,
            title       : '',
            description : '',
            categoryPath: '',
            date        : ''
        };
        this.setState(state);
        await this.getTrashArticleList();
    }

    // 获取垃圾箱中的文章数据
    public async getTrashArticleList() {
        const response = await request('note', 'getTrashArticleData');
        if (response && response.result === 0) {
            const state            = this.state;
            state.trashArticleList = response.data;
            this.setState(state);
        }
    }

    // 获取垃圾箱中的文章选中状态
    public setTrashArticleListSelectedState() {
        const state = this.state;
        const obj   = {};
        this.state.trashArticleList.map((item: any) => {
            obj[item.id] = false;
        });
        state.trashArticleSelectedMaps = obj;
        this.setState(state);
    }

    public async componentDidMount(): Promise<void> {
        this.initTrashArticleDetail();
        this.setTrashArticleListSelectedState();

        // todo 增加多选
        window.onkeydown = (e: KeyboardEvent) => {
            console.log(e);
            if (e.code === 'ShiftLeft') {
                this.keyboard.leftShift = true;
            }
        };

        // todo 增加多选
        window.onkeyup = (e: KeyboardEvent) => {
            console.log(e);
            if (e.code === 'ShiftLeft') {
                this.keyboard.leftShift = false;
            }
        }

    }

    // 获取垃圾箱中的文章详情数据
    public async getTrashArticleDetail(id: number) {
        const response = await request('note', 'getTrashArticleDetail', {id});
        if (response.result === 0) {
            const state                           = this.state;
            state.trashArticleDetail.id           = response.data.id;
            state.trashArticleDetail.cid          = response.data.cid;
            state.trashArticleDetail.title        = response.data.title;
            state.trashArticleDetail.categoryPath = response.data.crumbs;
            state.trashArticleDetail.description  = response.data.description;
            state.trashArticleDetail.date         = response.data.date;
            this.setState(state);
        }
    }

    // 垃圾箱中的文章被点击时的触发
    public itemSelectedHandel(id: number): any {

        const state = this.state;

        if (state.trashArticleSelectedMaps[id]) {
            return false;
        }

        const arrayMaps: any[] = Object.keys(state.trashArticleSelectedMaps);
        arrayMaps.some((key: string, index: number) => {
            if (this.state.trashArticleSelectedMaps[key]) {
                state.trashArticleSelectedMaps[key] = false;
                return;
            }
        });
        state.trashArticleSelectedMaps[id] = true;
        this.getTrashArticleDetail(id);
        this.setState(state);

    }

    // 删除垃圾箱中的文章
    public async removeTrashArticle(id: number) {
        const response = await request('note', 'removeTrashArticle', {id});
        if (response.result === 0) {
            const msg = 'crush success!';
            new VMessageService(msg, 'success', 3000).init();
            await this.initTrashArticleDetail();
            this.writeUpdateCategoryTask();
        }
    }

    // 恢复垃圾箱中的文章到原本的分类中
    public async resetTrashArticle(id: number, cid: number) {
        const response = await request('note', 'resetTrashArticle', {id, cid});
        if (response.result === 0) {
            const msg = 'restore this note success!';
            new VMessageService(msg, 'success', 3000).init();
            await this.initTrashArticleDetail();
            this.writeUpdateCategoryTask();
        }

        switch (response.messageCode) {
            case 1003:
                Service.Dialog.showMessageBox({
                        title    : 'Loss of category information',
                        type     : 'question',
                        message  : 'Loss of category information',
                        detail   : 'The category information for this note has been lost. Do you need to move to the tmp category?',
                        defaultId: 0,
                        cancelId : 1,
                        buttons  : ['Yes', 'Cancel']
                    },
                ).then(async (result: any) => {
                    const btnIndex: number = result.response;
                    if (btnIndex === 0) {
                        this.resetTrashArticleToTmpCategory(this.state.trashArticleDetail.id);
                    }
                });

                break;
        }
    }

    // 恢复垃圾箱中的丢失分类的文章到tmp分类中
    public async resetTrashArticleToTmpCategory(id: number) {
        const response = await request('note', 'resetTrashArticleToTmpCategory', {id, disable: 0});
        if (response.result === 0) {
            const msg = 'restore this note success!';
            new VMessageService(msg, 'success', 3000).init();
            await this.initTrashArticleDetail();
            this.writeUpdateCategoryTask();
        }
    }

    // 预览详情中的粉碎按钮被点击时
    public actionCrush() {
        if (this.state.trashArticleDetail.id) {
            Service.Dialog.showMessageBox({
                    title    : 'Crush this note',
                    type     : 'question',
                    message  : 'Crush this note',
                    detail   : 'Do you want to permanently crush this note?',
                    defaultId: 0,
                    cancelId : 1,
                    buttons  : ['Yes', 'Cancel']
                },
            ).then(async (result: any) => {
                const btnIndex: number = result.response;
                // btn 按钮被点击，删除被选中的Note
                if (btnIndex === 0) {
                    this.removeTrashArticle(this.state.trashArticleDetail.id);
                }
            })
        }
    }

    // 预览详情中的恢复按钮被点击时
    public actionRestore() {
        if (!(this.state.trashArticleDetail.categoryPath && this.state.trashArticleDetail.categoryPath.length > 0)) {

            Service.Dialog.showMessageBox({
                    title    : 'Loss of category information',
                    type     : 'question',
                    message  : 'Loss of category information',
                    detail   : 'The category information for this note has been lost. Do you need to move to the "tmp" category?',
                    defaultId: 0,
                    cancelId : 1,
                    buttons  : ['Yes', 'Cancel']
                },
            ).then(async (result: any) => {
                const btnIndex: number = result.response;
                if (btnIndex === 0) {
                    this.resetTrashArticleToTmpCategory(this.state.trashArticleDetail.id);
                }
            });

        } else {

            let categoryPath = '';

            this.state.trashArticleDetail.categoryPath.map((item: string) => {
                categoryPath += `.${item}`;
            });

            Service.Dialog.showMessageBox({
                    title    : 'Restore note',
                    type     : 'question',
                    message  : 'Restore note',
                    detail   : `Are you sure you want to restore this note to the "${categoryPath}" category?`,
                    defaultId: 0,
                    cancelId : 1,
                    buttons  : ['Yes', 'Cancel']
                }
            ).then(async (result: any) => {
                const btnIndex: number = result.response;
                if (btnIndex === 0) {
                    this.resetTrashArticle(this.state.trashArticleDetail.id, this.state.trashArticleDetail.cid);
                }
            });

        }
    }

    public writeUpdateCategoryTask(): void {
        store.dispatch({'type': `NOTE$WRITE_UPDATE_CATEGORY_TASK`});
    }

    public render() {
        return (
            <div className="trashArticleContainer">
                {this.state.trashArticleList && this.state.trashArticleList.length > 0 ?
                    <React.Fragment>
                        <div className="wrap">
                            <div className="list">
                                {
                                    this.state.trashArticleList.map((item: any) => {
                                        return (
                                            <div
                                                className={`item ${this.state.trashArticleSelectedMaps[item.id] ? 'active' : ''}`}
                                                key={item.id}
                                                onClick={this.itemSelectedHandel.bind(this, item.id)}
                                                onContextMenu={this.handleItemContextMenu.bind(this, item.id)}
                                            >
                                                <div className="text">{item.title}</div>
                                            </div>
                                        )
                                    })
                                }

                            </div>
                        </div>

                        {this.state.trashArticleDetail.id ?
                            <div className="preview">
                                <div className="params">
                                    <div className="image"/>
                                    <div className="item category-path">
                                        <label>Category:</label>
                                        <div className="text" key={this.state.trashArticleDetail.id}>
                                            {
                                                (this.state.trashArticleDetail.categoryPath &&
                                                    this.state.trashArticleDetail.categoryPath.length > 0) ?
                                                    this.state.trashArticleDetail.categoryPath.map((c: string, index: number) => {
                                                        return (<React.Fragment key={index}><em>.</em>{c}</React.Fragment>)
                                                    }) : 'none'
                                            }
                                        </div>
                                    </div>
                                    <div className="item">
                                        <label>Title:</label>
                                        <div className="text">{this.state.trashArticleDetail.title}</div>
                                    </div>
                                    <div className="item">
                                        <label>Date:</label>
                                        <div className="text">{this.state.trashArticleDetail.date}</div>
                                    </div>
                                    <div className="item">
                                        <label>Summary:</label>
                                        <div className="text">{this.state.trashArticleDetail.description}</div>
                                    </div>
                                </div>
                                <div className="action">
                                    <button className="btn waring" onClick={this.actionCrush}>Crush</button>
                                    <button className="btn" onClick={this.actionRestore}>Restore</button>
                                </div>
                            </div>
                            : null}
                    </React.Fragment>
                    : <div className="empty-data">
                        <p className="icon"><FontAwesomeIcon className="fa-icon" icon="trash"/></p>
                        <p>No note in the trash</p>
                    </div>}
            </div>
        );
    }
}

export default TrashArticle;
