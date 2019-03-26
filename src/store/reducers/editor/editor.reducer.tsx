interface DefaultState {
    content?: string
}

declare type Playload = DefaultState;

interface Action {
    type: string
    playload: DefaultState
}

export class EditorReducer {

    public body: DefaultState;
    public state: DefaultState;
    public playload: Playload;
    public modelName: string;

    constructor(ModelName: string) {
        this.modelName = ModelName;
        this.body      = {
            content: ''
        };
        this.playload  = {};
        this.Action    = this.Action.bind(this);
    }

    // 更新临时日志STORE
    public ADD() {
        const {content} = this.playload;
        this.body       = {content};
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