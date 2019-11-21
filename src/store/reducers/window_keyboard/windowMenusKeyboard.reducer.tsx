interface DefaultState {
    layout?: number
}

declare type Playload = DefaultState;

interface Action {
    type: string
    playload: Playload
}

export class WindowMenusKeyboardReducer {

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

    // 保存编辑器内的内容
    public CMD_OR_CTRL_S() {
        return this.state;
    }

    // 切换预览/编辑状态
    public CMD_OR_CTRL_E() {
        return this.state;
    }

    // 切换布局
    public CMD_OR_CTRL_W() {
        return this.state;
    }

    // 呼出超级搜索窗体
    public CMD_OR_CTRL_SHIFT_F() {
        return this.state;
    }

    // 聚焦文章/内容搜索框
    public CMD_OR_CTRL_F() {
        return this.state;
    }

    // 切换Trash模式
    public CMD_OR_CTRL_T() {
        return this.state;
    }

    public ESCAPE() {
        return this.state;
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
