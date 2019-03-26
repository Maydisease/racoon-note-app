import {EditorReducer} from './editor.reducer';
import {undoable}      from "../../middleware/undoable.middleware";

export const editor = (modelName: string) => {
    return {
        'EDITOR$HISTORY': undoable(new EditorReducer(modelName).Action)
    };
};