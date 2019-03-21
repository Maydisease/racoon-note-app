import {Service} from "../../../../lib/master.electron.lib";

class SuperSearchService {

    public superSearchClass: any;
    public superSearchWin: any;

    public open() {
        if (!Service.IPCRenderer.sendSync('getBrowserWindowList').search) {
            this.superSearchClass = new Service.WindowManages.search(true);
            this.superSearchWin   = this.superSearchClass.created();
        } else {
            if (this.superSearchWin && !this.superSearchWin.isDestroyed()) {
                if (this.superSearchWin.isVisible()) {
                    Service.Remote.getCurrentWindow().focus();
                }
                this.superSearchWin.isVisible() ? this.superSearchWin.hide() : this.superSearchWin.show();
            }
        }
    }

}

const $SuperSearchService = new SuperSearchService();
export {$SuperSearchService, SuperSearchService}