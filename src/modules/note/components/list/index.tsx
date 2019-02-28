import * as React        from 'react';
import {EventEmitter}    from "../../services/events.service";
import {ArticleService}  from "../../services/article.service";
import {Service}         from "../../../../lib/master.electron.lib";
import {store}           from "../../../../store";
import {storeSubscribe}  from "../../../../store/middleware/storeActionEvent.middleware";
import {connect}         from "react-redux";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

class ListComponent extends React.Component {

    public state: any = {
        inputFocusState   : false,
        clearInputBtnState: false,

        from: {
            searchKeys: {
                value: ''
            }
        },

        currentCid : null,
        articleList: [],
        articleObj : null
    };

    public contextMenu: any;
    public articleService: ArticleService;

    constructor(props: any) {
        super(props);
        this.articleService         = new ArticleService();
        this.handleInputActive      = this.handleInputActive.bind(this);
        this.handleChange           = this.handleChange.bind(this);
        this.clearSearchKeys        = this.clearSearchKeys.bind(this);
        this.getActiveList          = this.getActiveList.bind(this);
        this.handleItemClick        = this.handleItemClick.bind(this);
        this.removeNote             = this.removeNote.bind(this);
        this.clearItemSelectedState = this.clearItemSelectedState.bind(this);
        this.handleItemContextMenu  = this.handleItemContextMenu.bind(this);
        this.createdNote            = this.createdNote.bind(this);
        this.contextMenu            = new Service.Menu();
        this.contextMenuInit();
    }

    // contextMenu初始化
    public contextMenuInit() {
        const $this: this = this;
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'D',
            label      : 'Delete Note', click() {
                $this.removeNote()
            }
        }));
    }

    public async removeNote() {
        Service.Dialog.showMessageBox({
                title    : 'Delete this note',
                type     : 'question',
                message  : 'Delete this note',
                detail   : 'Do you really want to delete this note?',
                defaultId: 0,
                cancelId : 1,
                buttons  : ['Yes', 'Cancel']
            },
            // btn 按钮被点击，删除被选中的Note
            async (btnIndex: number) => {
                if (btnIndex === 0) {
                    const articleId = this.state.articleObj.id;
                    const request   = await new Service.ServerProxy('note', 'setArticleDisableState', {id: articleId, disable: 1}).send();

                    if (request.result !== 1) {

                        store.dispatch({
                            type: 'NOTE$SELECTED_ARTICLE'
                        });

                        store.dispatch({
                            type: 'NOTE$CLEAR_ARTICLE'
                        });

                        store.dispatch({
                            type: 'NOTE$CLEAR_ARTICLE_TEMP'
                        });

                        const state = this.state;
                        const index = state.articleList.findIndex((sourceItem: any) => this.state.articleObj === sourceItem);
                        state.articleList.splice(index, 1);
                        this.setState(state);

                    }
                }
            }
        );
    }

    // 清空搜索关键词
    public clearSearchKeys() {
        const state                 = this.state;
        state.from.searchKeys.value = '';
        state.clearInputBtnState    = false;
        state.inputFocusState       = false;
        this.setState(state);
    }

    // 表单修改时的数据同步
    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.clearInputBtnState            = event.target.value.length > 0;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
    }

    // 搜索框状态
    public handleInputActive(sourceState: any) {
        const state           = this.state;
        state.inputFocusState = !(!sourceState && this.state.from.searchKeys.value.length === 0);
        this.setState(state);
    }

    public async UpdateArticleListDom(cid: number) {
        const state       = this.state;
        state.currentCid  = cid;
        state.articleList = await this.getActiveList(cid);
        if (state.articleList) {
            state.articleList.map((item: any, index: number) => {
                state.articleList[index].selected = false;
            });
        }

        if (this.state.articleObj) {
            const index = state.articleList.findIndex((sourceItem: any) => this.state.articleObj.id === sourceItem.id);
            if (state.articleList[index]) {
                state.articleList[index].selected = true;
            }
        }

        this.setState(state);
    }

    public async componentDidMount() {

        EventEmitter.on('selectedCategory', async (cid: number) => {
            await this.UpdateArticleListDom(cid);
        });

        EventEmitter.on('createdNote', async (cid: number) => {
            await this.UpdateArticleListDom(cid);
        });

        storeSubscribe('NOTE$SAVE_ARTICLE', async (action: any) => {
            await this.UpdateArticleListDom(this.state.currentCid);
        });


        // 订阅搜索页面发送过来的选择搜索结果双击事件
        Service.RenderToRender.subject('search@searchListDoubleClick', async (event: any, params: any): Promise<boolean | void> => {
            const cid = params.data.cid;
            const id  = params.data.id;
            await this.UpdateArticleListDom(cid);
            const key = await this.state.articleList.findIndex((sourceItem: any) => sourceItem.id === id);
            await this.handleItemClick(this.state.articleList[key]);
        });

    }

    public async getActiveList(cid: number) {
        const request = await new Service.ServerProxy('note', 'getArticleData', {cid}).send();
        if (request.result !== 1) {
            return request.data;
        } else {
            return [];
        }
    }

    public clearItemSelectedState() {
        const state = this.state;
        state.articleList.some((item: any, index: number): any => {
            if (item.selected) {
                state.articleList[index].selected = false;
                return false;
            }
        });
        this.setState(state);
    }

    public handleItemClick(item: any): boolean | void {

        const state = this.state;
        const key   = state.articleList.findIndex((sourceItem: any) => item === sourceItem);

        if (this.state.articleObj && item.id === this.state.articleObj.id && state.articleList[key].selected) {
            return false;
        }

        this.clearItemSelectedState();

        state.articleList[key].selected = true;
        state.articleObj                = item;
        this.setState(state);

        store.dispatch({
            type    : 'NOTE$UPDATE_ARTICLE',
            playload: {
                id              : item.id,
                cid             : item.cid,
                title           : item.title,
                markdown_content: item.markdown_content,
                html_content    : item.html_content,
            }
        });

        store.dispatch({
            type    : 'NOTE$UPDATE_ARTICLE_TEMP',
            playload: {
                title           : item.title,
                markdown_content: item.markdown_content,
                html_content    : item.html_content
            }
        });

        store.dispatch({type: 'NOTE$SELECTED_ARTICLE'});

    }

    public handleItemContextMenu(item: any) {
        if (item.selected) {
            this.contextMenu.popup({window: Service.getWindow('master')});
        }
    }

    // 创建文章
    public async createdNote() {
        const resState = await this.articleService.createdNote(this.state.currentCid);
        console.log(resState);
        await this.getActiveList(this.state.currentCid);
        await this.UpdateArticleListDom(this.state.currentCid);
    }

    public render() {

        const ArticleItem = (props: any): any => {
            const articleList = props.data;
            if (articleList.length > 0) {
                return (
                    articleList.map((item: any, index: number) => {
                        return (
                            <div
                                className={`item ${item.selected === true && 'current'}`}
                                key={item.id}
                                onClick={this.handleItemClick.bind(this, item)}
                                onContextMenu={this.handleItemContextMenu.bind(this, item)}
                            >
                                <div className="date">1h</div>
                                <div className="context">
                                    <h2>{item.title}</h2>
                                    <div className="description">
                                        <dl>{item.description}</dl>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                );
            } else {
                return ('');
            }
        };

        const STORE_NOTE$FRAME = (this.props as any).STORE_NOTE$FRAME;

        return (
            <div className={`listContainer ${STORE_NOTE$FRAME.layout === 1 ? 'show' : ''}`}>
                <div className="searchContainer">
                    <div className={`wrap ${this.state.inputFocusState && 'focus'}`}>
                        <div className={`formBox ${this.state.inputFocusState && 'focus'}`}>
                            <FontAwesomeIcon className="fa-icon" icon="search"/>
                            <input
                                name="searchKeys"
                                type="text"
                                value={this.state.from.searchKeys.value}
                                onFocus={this.handleInputActive.bind(this, true)}
                                onBlur={this.handleInputActive.bind(this, false)}
                                placeholder="Search Notes"
                                onChange={this.handleChange}
                            />
                            {this.state.clearInputBtnState && <i className="icon iconfont icon-2 icon-wrong" onClick={this.clearSearchKeys}/>}
                        </div>
                    </div>

                    <div className={`btn ${!this.state.currentCid && 'disable'}`} onClick={this.createdNote}>
                        <FontAwesomeIcon className="fa-icon" icon="plus"/>
                    </div>
                </div>
                <div className="article-list">
                    {this.state.articleList && this.state.articleList.length > 0 ? <ArticleItem data={this.state.articleList}/> : <div className="not-data">No notes ...</div>}
                </div>
            </div>
        );
    }
}

export default connect((state: any) => state)(ListComponent);
