import {note} from './note';
import {windowKeyboard} from './window_keyboard';

export const reducers = {
    ...note('NOTE$'),
    ...windowKeyboard('WINDOW_KEYBOARD$'),
};