import {EditorReducer} from './editor.reducer';

const reduxUndo = require('redux-undo').default;

export const editor = (modelName: string) => {
    return {
        'EDITOR$HISTORY': reduxUndo(new EditorReducer(modelName).Action, {
            limit : 200,
            debug : true,
            filter: (action: any, currentState: any, previousHistory: any) => {
                return !(action.type === 'EDITOR$CLEAR');
            }
        })
    };
};