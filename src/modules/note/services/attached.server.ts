import {Service} from "../../../lib/master.electron.lib";

export class AttachedService {

    public attachedClass: any;
    public attachedWin: any;

    public open() {
        this.attachedClass = new Service.WindowManages.attached(true);
        this.attachedWin   = this.attachedClass.created();
    }

}