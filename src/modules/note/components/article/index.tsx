import * as React        from 'react';
import EditorComponent   from './editor';
import BrowseComponent   from "./browse";
import {connect}         from 'react-redux';
import {store}           from "../../../../store";
import {storeSubscribe}  from "../../../../store/middleware/storeActionEvent.middleware";
import {ArticleService}  from "../../services/article.service";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {Service}         from "../../../../lib/master.electron.lib";

class ArticleComponent extends React.Component {

    public state: any = {
        id              : null,
        title           : '',
        html_content    : '',
        markdown_content: '',
        editState       : false,
        editAndBrowse   : false,
        form            : {
            title: {
                value: ''
            }
        }
    };

    public timer: any;
    public props: any;
    public browseComponentChild: any;

    constructor(props: any) {
        super(props);
        this.props                  = props;
        this.switchEditState        = this.switchEditState.bind(this);
        this.handleTitleInputChange = this.handleTitleInputChange.bind(this);
        this.handleFrameToggle      = this.handleFrameToggle.bind(this);
        this.handleEditAndBrowse    = this.handleEditAndBrowse.bind(this);
        this.browseComponentRef     = this.browseComponentRef.bind(this);
        this.timer                  = null;
    }

    // 切换编辑状态 [预览/编辑]
    public switchEditState() {
        const ARTICLE_TEMP     = (this.props as any).STORE_NOTE$ARTICLE_TEMP;
        const state            = this.state;
        state.editState        = !this.state.editState;
        state.form.title.value = ARTICLE_TEMP.title;
        this.setState(state);
    }

    // 表单修改时的数据同步
    public handleTitleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.form[event.target.name].value = event.target.value;
        this.setState(state);

        if (this.timer) {
            clearTimeout(this.timer);
        }
        this.timer = setTimeout(() => {
            store.dispatch({
                type    : 'NOTE$UPDATE_ARTICLE_TEMP',
                playload: {
                    title           : this.state.form.title.value,
                    markdown_content: (this.props as any).STORE_NOTE$ARTICLE_TEMP.markdown_content,
                    html_content    : (this.props as any).STORE_NOTE$ARTICLE_TEMP.html_content
                }
            });
            clearTimeout(this.timer);
        }, 300)

    }

    public componentDidMount() {

        // 订阅选中文章事件
        storeSubscribe('NOTE$SELECTED_ARTICLE', () => {
            const ARTICLE_TEMP     = (this.props as any).STORE_NOTE$ARTICLE_TEMP;
            const state            = this.state;
            state.editState        = false;
            state.form.title.value = ARTICLE_TEMP.title;
            this.setState(state);
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_S', async () => {
            if (this.state.editState) {
                await new ArticleService().saveNote();
            }
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_E', async () => {
            this.switchEditState();
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_W', async () => {
            this.handleFrameToggle();
        });

        // 订阅搜索页面发送过来的选择搜索结果双击事件
        Service.RenderToRender.subject('search@superSearchSelectedList', async (event: any, params: any): Promise<boolean | void> => {
            if (params.data.searchType === 1) {
                this.handleFrameToggle(true);
                store.dispatch({
                    type    : 'NOTE$QUICK_SEARCH',
                    playload: {quickSearchKey: params.data.searchKey}
                });
            }
        });

        Service.RenderToRender.subject('search@superSearchChangeFilterType', async (event: any, params: any): Promise<boolean | void> => {
            if (params.data.searchType === 1) {
                store.dispatch({
                    type    : 'NOTE$QUICK_SEARCH',
                    playload: {quickSearchKey: params.data.searchKey}
                });
            } else {
                store.dispatch({type: 'NOTE$UN_SEARCH_TAG'})
            }
        });

        Service.RenderToRender.subject('search@superSearchClearKeys', async (): Promise<boolean | void> => {
            store.dispatch({type: 'NOTE$UN_SEARCH_TAG'});
        });


    }

    // 切换article区域全屏化状态[显示category，list/不显示]
    public handleFrameToggle(forceLayout: boolean | undefined = false): void {
        let layout = (this.props as any).STORE_NOTE$FRAME.layout === 1 ? 0 : 1;
        if (forceLayout) {
            layout = 1;
        }

        store.dispatch({
            type    : 'NOTE$CHANGE_FRAME_STATE',
            playload: {layout}
        });
    }

    public handleEditAndBrowse() {
        const state         = this.state;
        state.editAndBrowse = !this.state.editAndBrowse;
        this.setState(state);
    }

    public browseComponentRef(refs: React.ComponentClass) {
        this.browseComponentChild = refs;
    }

    public render() {

        const FRAME        = (this.props as any).STORE_NOTE$FRAME;
        const ARTICLE      = (this.props as any).STORE_NOTE$ARTICLE;
        const ARTICLE_TEMP = (this.props as any).STORE_NOTE$ARTICLE_TEMP;

        return (
            <div className="articleContainer">
                {ARTICLE.id &&
                <div className="content-bar">
                    <div className="title">
                        {
                            this.state.editState ?
                                <input name="title" value={this.state.form.title.value} onChange={this.handleTitleInputChange} placeholder="note title..."/> :
                                <span>{ARTICLE_TEMP.title}</span>
                        }
                    </div>
                    {this.state.editState && FRAME.layout === 0 &&
                    <div className={`menu ${this.state.editAndBrowse ? 'current' : ''}`}>
                        <i className='icon' onClick={this.handleEditAndBrowse}>
                            <FontAwesomeIcon className={`${this.state.editAndBrowse ? 'light' : ''}`} icon="columns"/>
                        </i>
                    </div>
                    }
                    <div className={`menu frameToggle ${FRAME.layout === 0 ? 'current' : ''}`}>
						<i className='icon' onClick={this.handleFrameToggle.bind(this, false)}>
                            <FontAwesomeIcon className={`${!this.state.editState ? 'light' : ''}`} icon="expand-arrows-alt"/>
                        </i>
                    </div>
                    <div className={`menus icon-browse ${this.state.editState ? 'edit' : 'browse'}`} onClick={this.switchEditState}>
                        {/*<i className={`icon iconfont icon-browse ${!this.state.editState ? 'light' : ''} `}/>*/}
                        <FontAwesomeIcon className={`icon ${!this.state.editState ? 'light' : ''}`} icon="eye"/>
                        <FontAwesomeIcon className={`icon ${this.state.editState ? 'light' : ''}`} icon="edit"/>
                    </div>
                </div>
                }
                {ARTICLE.id &&
                <div className="content">
                    {
                        this.state.editAndBrowse && this.state.editState && FRAME.layout === 0 &&
                        <React.Fragment>
                            <BrowseComponent/>
							<div className="columns-line"/>
                        </React.Fragment>
                    }
					<EditorComponent displayState={this.state.editState}/>
					<BrowseComponent displayState={this.state.editState}/>
                </div>
                }
            </div>
        );
    }
}

export default connect<any>((state: any): any => state)(ArticleComponent);
