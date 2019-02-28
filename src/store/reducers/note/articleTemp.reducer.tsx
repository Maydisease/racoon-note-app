interface DefaultState {
    title?: string,
    markdown_content?: string,
    html_content?: string
}

declare type Playload = DefaultState;

interface Action {
    type: string
    playload: DefaultState
}

export class ArticleTempReducer {

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

    // 更新临时日志STORE
    public UPDATE_ARTICLE_TEMP() {
        const {title, markdown_content, html_content} = this.playload;

        this.body.title            = title;
        this.body.markdown_content = markdown_content;
        this.body.html_content     = html_content;

        return {...this.state, ...this.body};
    }

    // 清空临时日志STORE
    public CLEAR_ARTICLE_TEMP() {
        this.body  = {};
        this.state = {};
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