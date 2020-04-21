import {Service} from "../../../../lib/master.electron.lib";

class SettingService {

    public userOptionsClass: any;
    public userOptionsWin: any;

    public open() {
        if (!Service.IPCRenderer.sendSync('getBrowserWindowList').userOptions) {
            this.userOptionsClass = new Service.WindowManages.userOptions(true);
            this.userOptionsWin   = this.userOptionsClass.created();
        } else {
            if (this.userOptionsWin && !this.userOptionsWin.isDestroyed()) {
                if (this.userOptionsWin.isVisible()) {
                    Service.Remote.getCurrentWindow().focus();
                }
                this.userOptionsWin.isVisible() ? this.userOptionsWin.hide() : this.userOptionsWin.show();
            }
        }
    }

}

const $SettingService = new SettingService();
export {$SettingService, SettingService}
