import {Service} from "../../../lib/master.electron.lib";

export class SuperSearchService {
    // constructor() {
    //
    // }
    public init() {
        const createdWindow = Service.CreatedWindow;

        const createdMasterWindow = (route: string | undefined = undefined) => {
            const windowHash   = 'superSearch';
            const parentWindow = Service.getWindow(Service.getCurrentWinHash());
            const options      = {
                title          : 'super search',
                minWidth          : 600,
                minHeight         : 400,
                focusable      : true,
                show           : false,
                autoHideMenuBar: true,
                frame          : true,
                maximizable    : false,
                minimizable    : false,
                parent         : parentWindow,
                backgroundColor: '#1E2022',
                webPreferences : {
                    webSecurity: false
                }
            };

            const renderAddress                                       = `${Service.Config.APP.HOST}:${Service.Config.APP.PORT}${route ? '/' + route : ''}`;
            const win                                                 = createdWindow(options, renderAddress);
            Service.Remote.getGlobal('browserWindowList')[windowHash] = win;
            // win.webContents.openDevTools();
            return win;
        };

        createdMasterWindow('note_search');

    }
}