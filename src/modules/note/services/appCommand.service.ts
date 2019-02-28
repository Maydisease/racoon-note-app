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
            },
            // btn 按钮被点击，提交删除分类操作
            async (btnIndex: number): Promise<void | boolean> => {
                if (btnIndex === 0) {
                    Service.SignOut();
                }
            }
        );
    }

}