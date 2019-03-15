interface DefaultState {
    id?: number | null
    cid?: number | null
    title?: string
    markdown_content?: string
    html_content?: string
    moveArticleId?: number
    receiveCategoryId?: number
    quickSearchKey?: string
}

declare type Playload = DefaultState;

interface Action {
    type: string,
    playload: Playload
}

export class ArticleReducer {

    public body: DefaultState;
    public state: DefaultState;
    public playload: Playload;
    public modelName: string;

    constructor(ModelName: string) {
        this.modelName = ModelName;
        this.body      = {};
        this.playload  = {};
        this.Action    = this.Action.bind(this);
    }

    // 更新日志STORE
    public UPDATE_ARTICLE() {
        const {id, cid, title, markdown_content, html_content} = this.playload;
        this.body.id                                           = id;
        this.body.cid                                          = cid;
        this.body.title                                        = title;
        this.body.markdown_content                             = markdown_content;
        this.body.html_content                                 = html_content;

        return {...this.state, ...this.body};
    }

    // 清空日志STORE
    public CLEAR_ARTICLE(): DefaultState {
        this.body  = {};
        this.state = {};
        return {...this.state, ...this.body};
    }

    // 保存日志STORE[事件传播]
    public SAVE_ARTICLE(): DefaultState {
        return {...this.state};
    }

    // 选中日志STORE[事件传播]
    public SELECTED_ARTICLE(): DefaultState {
        return {...this.state};
    }

    // 移动日志STORE[事件传播]
    public MOVE_ARTICLE(): DefaultState {
        const {moveArticleId, receiveCategoryId} = this.playload;
        this.body.moveArticleId                  = moveArticleId;
        this.body.receiveCategoryId              = receiveCategoryId;
        return {...this.state, ...this.body};
    }

    public QUICK_SEARCH(): DefaultState {
        const {quickSearchKey}   = this.playload;
        this.body.quickSearchKey = quickSearchKey;
        return {...this.state, ...this.body};
    }

    public Action(state: DefaultState = this.body, action: Action) {
        if (action.type && action.type.indexOf(this.modelName) === 0) {
            const typeName = action.type.substring(this.modelName.length, action.type.length);
            if (this[typeName]) {
                this.state    = state;
                this.playload = action.playload;
                return this[typeName]();
            } else {
                return state;
            }
        } else {
            return state;
        }
    }

}