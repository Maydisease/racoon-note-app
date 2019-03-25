import {note}           from './note';
import {editor}         from './editor';
import {windowKeyboard} from './window_keyboard';

export const reducers = {
    ...note('NOTE$'),
    ...editor('EDITOR$'),
    ...windowKeyboard('WINDOW_KEYBOARD$'),
};