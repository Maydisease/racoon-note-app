interface DefaultState {
    isTrashCrush?: boolean
}

declare type Playload = DefaultState;

interface Action {
    type: string
    playload: Playload
}

export class TaskReducer {

    public body: DefaultState;
    public state: DefaultState;
    public playload: Playload;
    public modelName: string;

    constructor(ModelName: string) {
        this.modelName = ModelName;
        this.body      = {
            isTrashCrush: false
        };
        this.playload  = {};
        this.Action    = this.Action.bind(this);
    }

    public WRITE_UPDATE_CATEGORY_TASK() {
        this.body.isTrashCrush = true;
        return {...this.state, ...this.body};
    }

    public CLEAN_UPDATE_CATEGORY_TASK() {
        this.body.isTrashCrush = true;
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
