interface DefaultState {
    viewContentWidth?: number
}

declare type Playload = DefaultState;

interface Action {
    type: string
    playload: Playload
}

export class UserOptionsReducer {

    public body: DefaultState;
    public state: DefaultState;
    public playload: Playload;
    public modelName: string;

    constructor(ModelName: string) {
        this.modelName = ModelName;
        this.body      = {
            viewContentWidth: 0
        };
        this.playload  = {};
        this.Action    = this.Action.bind(this);
    }

    public UPDATE_VIEW_CONTENT_WIDTH() {
        const {viewContentWidth}   = this.playload;
        this.body.viewContentWidth = viewContentWidth;
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
