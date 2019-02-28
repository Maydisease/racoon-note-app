import {WindowMenusKeyboardReducer} from './windowMenusKeyboard.reducer';

export const windowKeyboard = (modelName: string) => {
    return {
        'STORE_WINDOW_KEYBOARD$': new WindowMenusKeyboardReducer(modelName).Action
    }
};