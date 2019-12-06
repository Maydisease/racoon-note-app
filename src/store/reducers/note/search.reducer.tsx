interface DefaultState {
    value?: string
}

declare type Playload = DefaultState;

interface Action {
    type: string,
    playload: Playload
}

export class SearchReducer {

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

    // 更新搜索关键字
    public UPDATE_SEARCH_KEY(): DefaultState {
        const {value}   = this.playload;
        this.body.value = value;
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
