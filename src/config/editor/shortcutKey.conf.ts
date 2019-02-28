import {Service} from "../../lib/master.electron.lib";

const win = (Service.Process.platform as string).indexOf('win') === 0;

const defaultKeyMaps = {
    save: (win ? 'Ctrl' : 'Cmd') + '-S'
};

export default defaultKeyMaps;