import {Service} from "../../../lib/master.electron.lib";

export class AttachedService {

    public attachedClass: any;
    public attachedWin: any;

    public open() {
        if (!Service.IPCRenderer.sendSync('getBrowserWindowList').attached) {
            this.attachedClass = new Service.WindowManages.attached(true);
            this.attachedWin   = this.attachedClass.created();
        } else {
            if (this.attachedWin && !this.attachedWin.isDestroyed()) {
                if (this.attachedWin.isVisible()) {
                    Service.Remote.getCurrentWindow().focus();
                }
                this.attachedWin.isVisible() ? this.attachedWin.hide() : this.attachedWin.show();
            }
        }
    }

}