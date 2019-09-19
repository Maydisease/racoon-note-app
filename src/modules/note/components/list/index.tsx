import * as React        from 'react';
import {EventEmitter}    from "../../services/events.service";
import {ArticleService}  from "../../services/article.service";
import {Service}         from "../../../../lib/master.electron.lib";
import {request}         from "../../services/requst.service";
import {store}           from "../../../../store";
import {storeSubscribe}  from "../../../../store/middleware/storeActionEvent.middleware";
import {connect}         from "react-redux";
import {friendlyDate}    from '../../../../utils/friendlyDate.utils';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import SharePanel        from "./sharePanel";

class ListComponent extends React.Component {

    public state: any = {
        inputFocusState   : false,
        clearInputBtnState: false,
        quickSearchType   : 0, // 0 title 1 article

        from: {
            searchKeys: {
                value: ''
            }
        },

        currentCid     : null,
        articleList    : [],
        articleObj     : null,
        sharePanelPos  : {
            x: 0,
            y: 0
        },
        sharePanelState: false,
        shareInfo      : {}
    };

    public listContextMenu: any;
    public quickSearchContextMenu: any;
    public quickSearchTimer: number;
    public articleService: ArticleService;
    public searchElement: React.RefObject<HTMLInputElement>;
    public listElement: HTMLElement | null;

    constructor(props: any) {
        super(props);
        this.articleService               = new ArticleService();
        this.handleInputActive            = this.handleInputActive.bind(this);
        this.handleChange                 = this.handleChange.bind(this);
        this.clearSearchKeys              = this.clearSearchKeys.bind(this);
        this.getArticleList               = this.getArticleList.bind(this);
        this.handleItemClick              = this.handleItemClick.bind(this);
        this.removeNote                   = this.removeNote.bind(this);
        this.clearItemSelectedState       = this.clearItemSelectedState.bind(this);
        this.handleItemContextMenu        = this.handleItemContextMenu.bind(this);
        this.handleQuickSearchContextMenu = this.handleQuickSearchContextMenu.bind(this);
        this.quickSearchContextMenuInit   = this.quickSearchContextMenuInit.bind(this);
        this.closeSharePanel              = this.closeSharePanel.bind(this);
        this.updateShareInfo              = this.updateShareInfo.bind(this);
        this.listContextMenu              = new Service.Menu();
        this.quickSearchContextMenu       = new Service.Menu();
        this.searchElement                = React.createRef();
        this.listContextMenuInit();
        this.quickSearchContextMenuInit();
    }

    // listContextMenu初始化
    public listContextMenuInit() {

        const $this: this = this;

        this.listContextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'S',
            label      : 'Share Note', click() {
                $this.shareNote()
            }
        }));

        this.listContextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'L',
            label      : 'Lock Note', click() {
                $this.lockNote()
            }
        }));

        this.listContextMenu.append(new Service.MenuItem({type: 'separator'}));

        this.listContextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'D',
            label      : 'Delete Note', click() {
                $this.removeNote()
            }
        }));

    }

    public shareNote() {
        const state: any      = this.state;
        state.sharePanelState = true;
        this.setState(state);
        this.setSharePanelPos();
    }

    public closeSharePanel() {
        const state: any      = this.state;
        state.sharePanelState = false;
        this.setState(state);
        this.UpdateArticleListDom(this.state.currentCid);
    }

    // 设置ICON面板的位置
    public setSharePanelPos() {
        setTimeout(() => {
            const listElement     = document.getElementById(`list_element_${this.state.articleObj.id}`) as HTMLElement | any;
            const state           = this.state;
            state.sharePanelPos.y = listElement.getBoundingClientRect().top;
            state.sharePanelPos.x = listElement.offsetLeft;
            this.setState(state);
        }, 0);

    }


    // 更改快速搜索的类型
    public changeQuickSearchType(type: number) {
        const state           = this.state;
        state.quickSearchType = type;
        this.setState(state);
        this.quickSearchEvent();
    }

    // listContextMenu初始化
    public quickSearchContextMenuInit() {

        const $this: this = this;

        this.quickSearchContextMenu.append(
            new Service.MenuItem({
                type: 'radio', label: 'search title', click() {
                    $this.changeQuickSearchType(0);
                }
            })
        );

        this.quickSearchContextMenu.append(new Service.MenuItem(
            {
                type : 'radio',
                label: 'search content', click() {
                    $this.changeQuickSearchType(1);
                }
            }
        ));

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
                    const response  = await request('note', 'setArticleDisableState', {id: articleId, disable: 1});

                    if (response.result !== 1) {

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
                        const index = state.articleList.findIndex((sourceItem: any) => this.state.articleObj.id === sourceItem.id);
                        state.articleList.splice(index, 1);
                        this.setState(state);

                    }
                }
            }
        );
    }

    // 锁定文章
    public async lockNote() {
        const articleId = this.state.articleObj.id;
        const response  = await request('note', 'setArticleLockState', {id: articleId, lock: 1});
        if (response.result === 0) {
            const state                       = this.state;
            const key                         = state.articleList.findIndex((sourceItem: any) => articleId === sourceItem.id);
            state.articleList[key].lock       = 1;
            state.articleList[key].updateTime = new Date().toTimeString();
            this.setState(state);
            this.handleItemClick(this.state.articleList[key], true);
        }
    }

    // 解锁文章
    public unLockNote() {
        const articleId = this.state.articleObj.id;
        // 如果list是被选中的文章
        if (this.state.articleObj.cid === this.state.currentCid) {

            const state                       = this.state;
            const key                         = state.articleList.findIndex((sourceItem: any) => articleId === sourceItem.id);
            state.articleList[key].lock       = 0;
            state.articleList[key].updateTime = new Date().toTimeString();
            this.setState(state);
            this.handleItemClick(this.state.articleObj, true);

        }
        // 如果list中不存在被选中的文章
        else {

            // 更新store中NOTE内的文章字段组
            store.dispatch({
                type    : 'NOTE$UPDATE_ARTICLE',
                playload: {
                    id   : this.state.articleObj.id,
                    cid  : this.state.articleObj.cid,
                    title: this.state.articleObj.title,
                    lock : 0
                }
            });

            // 发送列表文章选中事件
            store.dispatch({type: 'NOTE$SELECTED_ARTICLE'});
        }

    }

    // 清空搜索关键词
    public clearSearchKeys() {
        const state                 = this.state;
        state.from.searchKeys.value = '';
        state.clearInputBtnState    = false;
        state.inputFocusState       = false;
        this.setState(state);
        this.quickSearchEvent();
    }


    // 表单修改时的数据同步
    public handleChange(event: React.ChangeEvent<HTMLInputElement>) {

        const state                         = this.state;
        state.clearInputBtnState            = event.target.value.length > 0;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);

        if (this.quickSearchTimer) {
            clearTimeout(this.quickSearchTimer)
        }

        this.quickSearchTimer = window.setTimeout(async () => {
            this.quickSearchEvent();
            clearTimeout(this.quickSearchTimer);
        }, 200)
    }

    // 全局搜索事件
    public quickSearchEvent() {
        switch (this.state.quickSearchType) {
            case 0:
                store.dispatch({
                    type: 'NOTE$UN_SEARCH_TAG'
                });
                break;
            case 1:
                store.dispatch({
                    type    : 'NOTE$QUICK_SEARCH',
                    playload: {quickSearchKey: this.state.from.searchKeys.value}
                });
                break;
        }
    }

    // 搜索框聚焦/onFocus失焦/onBlur事件
    public handleInputActive(sourceState: any) {
        const state           = this.state;
        state.inputFocusState = !(!sourceState && this.state.from.searchKeys.value.length === 0);
        this.setState(state);
    }

    // 更新文章列表
    public async UpdateArticleListDom(cid: number) {
        const state       = this.state;
        state.currentCid  = cid;
        state.articleList = await this.getArticleList(cid);
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

        // 监听categoryComment组件传递过来的选中事件
        EventEmitter.on('selectedCategory', async (cid: number) => {
            await this.UpdateArticleListDom(cid);
        });

        // 监听categoryComment传递过来的创建日志事件
        EventEmitter.on('createdNote', async (cid: number) => {
            await this.UpdateArticleListDom(cid);
        });

        // 监听监听articleComment传递过来的保存日志事件
        storeSubscribe('NOTE$SAVE_ARTICLE', async (action: any) => {
            await this.UpdateArticleListDom(this.state.currentCid);
        });

        // 监听articleComponent传递过来的解锁日志事件
        storeSubscribe('NOTE$UNLOCK_ARTICLE', (action: any) => {
            this.unLockNote();
        });


        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_F', async (action: any) => {
            const element = (this.searchElement.current as HTMLInputElement);
            if (element === document.activeElement) {
                element.blur();
                this.handleInputActive(false);
            } else {
                element.focus();
                this.handleInputActive(true);
            }
        });

        // 订阅搜索页面发送过来的选择搜索结果双击事件
        Service.RenderToRender.subject('search@superSearchSelectedList', async (event: any, params: any): Promise<boolean | void> => {
            const cid = params.data.cid;
            const id  = params.data.id;
            await this.UpdateArticleListDom(cid);
            const key = await this.state.articleList.findIndex((sourceItem: any) => sourceItem.id === id);
            await this.handleItemClick(this.state.articleList[key]);
        });

    }

    // 获取文章列表
    public async getArticleList(cid: number) {
        const response = await request('note', 'getArticleList', {cid});
        if (response.result !== 1) {
            return response.data;
        } else {
            return [];
        }
    }

    // 清除文章选中状态
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

    // 获取文章详情
    public async getArticleData(id: number) {
        const response = await request('note', 'getArticleData', {id});
        if (response.result !== 1) {
            return response.data;
        } else {
            return [];
        }
    }

    public updateShareInfo(item: any) {
        const state     = this.state;
        const key       = state.articleList.findIndex((sourceItem: any) => item.id === sourceItem.id);
        state.shareInfo = {
            aid           : state.articleList[key].id,
            share_code    : state.articleList[key].share_code,
            on_share      : state.articleList[key].on_share,
            use_share_code: state.articleList[key].use_share_code
        };
        this.setState(state);
    }

    // 文章列表被点击
    public async handleItemClick(item: any, forceUpdate: boolean = false, e?: any): Promise<boolean | void> {

        const state = this.state;
        const key   = state.articleList.findIndex((sourceItem: any) => item === sourceItem);

        if (!forceUpdate && this.state.articleObj && item.id === this.state.articleObj.id && state.articleList[key].selected) {
            return false;
        }

        // 清除文章列表被选中的item
        this.clearItemSelectedState();

        state.articleList[key].selected = true;
        state.articleObj                = item;
        state.shareInfo                 = {
            aid           : state.articleList[key].id,
            share_code    : state.articleList[key].share_code,
            on_share      : state.articleList[key].on_share,
            use_share_code: state.articleList[key].use_share_code,
            share_address : state.articleList[key].share_address
        };
        this.setState(state);

        let response;

        response = await Service.ClientCache('/note/article').getArticle(item.id);

        // 使用文章列表缓存机制
        if (!response) {
            console.log('no cache0');
            response = await this.getArticleData(item.id);
            await Service.ClientCache('/note/article').addArticle(response);
        } else if ((response.updateTime < item.updateTime) || forceUpdate) {
            console.log('no cache1');
            response = await this.getArticleData(item.id);
            await Service.ClientCache('/note/article').updateArticle(item.id, response);
        } else {
            console.log('cache');
        }

        // 更新store中NOTE内的文章字段组
        store.dispatch({
            type    : 'NOTE$UPDATE_ARTICLE',
            playload: {
                id              : response.id,
                cid             : response.cid,
                title           : response.title,
                lock            : response.lock,
                markdown_content: response.markdown_content,
                html_content    : response.html_content,
            }
        });

        // 更新store中NOTE内的临时文章字段组
        store.dispatch({
            type    : 'NOTE$UPDATE_ARTICLE_TEMP',
            playload: {
                title           : response.title,
                markdown_content: response.markdown_content,
                html_content    : response.html_content
            }
        });

        // 发送列表文章选中事件
        store.dispatch({type: 'NOTE$SELECTED_ARTICLE'});

    }

    // 被响应的文章列表右键上下文菜单事件
    public handleItemContextMenu(item: any, e?: any) {
        if (item.selected) {

            const items = this.listContextMenu.items;

            /**
             *
             * list context menu index
             *
             * items[0] -> Delete
             * items[1] -> Lock
             *
             */

            switch (item.lock) {
                case 0:
                    items[0].enabled = true;
                    break;
                case 1:
                    items[0].enabled = false;
                    break;
            }

            this.listContextMenu.popup({window: Service.getWindow('master')});
        }
    }

    // 被响应的搜索分类选择上下文菜单事件
    public handleQuickSearchContextMenu() {
        this.quickSearchContextMenu.popup({window: Service.getWindow('master')});
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
                                id={`list_element_${item.id}`}
                                onClick={this.handleItemClick.bind(this, item, false)}
                                onContextMenu={this.handleItemContextMenu.bind(this, item)}
                            >
                                <div className="subscript">
                                    <span>{friendlyDate(item.updateTime)}</span>
                                    {
                                        item.on_share &&
										<span className='share-icon'>
                                            <FontAwesomeIcon className="fa-icon" icon="share-alt"/>
                                        </span>
                                    }
                                </div>
                                <div className="context">
                                    <h2>{item.title}</h2>
                                    <div className="description">
                                        {item.lock === 0 &&
										<dl>{item.description}</dl>
                                        }
                                        {item.lock === 1 &&
										<dl><p/><p/><p/></dl>
                                        }
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
                            <FontAwesomeIcon className="searchIcon fa-icon" icon="search"/>
                            <input
                                ref={this.searchElement}
                                name="searchKeys"
                                type="text"
                                value={this.state.from.searchKeys.value}
                                onFocus={this.handleInputActive.bind(this, true)}
                                onBlur={this.handleInputActive.bind(this, false)}
                                placeholder="Search Notes"
                                onChange={this.handleChange}
                            />
                            <label className="clearIcon" onClick={this.clearSearchKeys} style={{display: this.state.clearInputBtnState ? 'block' : 'none'}}>
                                <FontAwesomeIcon className="clearSearchKey fa-icon" icon="times-circle"/>
                            </label>
                        </div>
                        <div className='searchTypeIcon' onClick={this.handleQuickSearchContextMenu}>
                            <FontAwesomeIcon className="fa-icon" icon={this.state.quickSearchType === 0 ? 'file' : 'file-alt'}/>
                        </div>
                    </div>
                </div>
                <div className="article-list">
                    {this.state.articleList && this.state.articleList.length > 0 ? <ArticleItem data={this.state.articleList}/> : <div className="not-data">No notes ...</div>}
                </div>

                {/*分类ICON选择面板组件*/}
                <SharePanel
                    key={this.state.shareInfo.aid}
                    shareInfo={this.state.shareInfo}
                    pos={this.state.sharePanelPos}
                    show={this.state.sharePanelState}
                    cancelEvent={this.closeSharePanel}
                />
            </div>
        );
    }
}

export default connect((state: any) => state)(ListComponent);
