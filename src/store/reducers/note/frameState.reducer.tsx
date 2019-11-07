interface DefaultState {
    layout?: number,
    editLayout?: boolean,
    editMode?: boolean,
    trashMode?: boolean,
}

declare type Playload = DefaultState;

interface Action {
    type: string
    playload: Playload
}

export class FrameStateReducer {

    public body: DefaultState;
    public state: DefaultState;
    public playload: Playload;
    public modelName: string;

    constructor(ModelName: string) {
        this.modelName = ModelName;
        this.body      = {
            layout    : 1,
            editLayout: true,
            trashMode : false
        };
        this.playload  = {};
        this.Action    = this.Action.bind(this);
    }

    // 更新UI框架状态
    public CHANGE_FRAME_STATE() {

        const {layout}   = this.playload;
        this.body.layout = layout;

        return {...this.state, ...this.body};
    }

    public CHANGE_EDITOR_COLUMN() {
        const {editLayout}   = this.playload;
        this.body.editLayout = editLayout;

        return {...this.state, ...this.body};
    }

    public CHANGE_EDITOR_MODE() {
        const {editMode}   = this.playload;
        this.body.editMode = editMode;

        return {...this.state, ...this.body};
    }

    public CHANGE_TRASH_MODE_STATE() {
        const {trashMode}   = this.playload;
        this.body.trashMode = trashMode;

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
