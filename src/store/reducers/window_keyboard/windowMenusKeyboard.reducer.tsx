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

    // 更新UI框架状态
    public CMD_OR_CTRL_S() {
        return this.state;
    }

    // 更新UI框架状态
    public CMD_OR_CTRL_E() {
        return this.state;
    }

    public CMD_OR_CTRL_W() {
        return this.state;
    }

    public CMD_OR_CTRL_SHIFT_F() {
        return this.state;
    }

    // editor -> undo
    public CMD_OR_CTRL_Z() {
        return this.state;
    }

    // editor -> redo
    public CMD_OR_CTRL_SHIFT_Z() {
        return this.state;
    }

    public CMD_OR_CTRL_F() {
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