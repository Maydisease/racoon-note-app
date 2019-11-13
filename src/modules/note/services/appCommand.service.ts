import {Service} from "../../../lib/master.electron.lib";

export class AppCommandService {

    public signOut() {
        Service.Dialog.showMessageBox({
                title    : 'warning',
                type     : 'question',
                message  : 'Sign out App',
                detail   : 'Are you sure you want to sign out of the app?',
                defaultId: 0,
                cancelId : 1,
                buttons  : ['Yes', 'Cancel']
            }
        ).then((result: any) => {
            const btnIndex: number = result.response;
            if (btnIndex === 0) {
                Service.SignOut();
            }
        })
    }

}
