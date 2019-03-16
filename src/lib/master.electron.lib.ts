declare const masterModules: any;

const Service = {

    Remote          : masterModules.electron.remote,
    IPCRenderer     : masterModules.electron.ipcRenderer,
    CreatedWindow   : masterModules.electron.remote.getGlobal('service').CreatedWindow,
    WindowManages   : masterModules.electron.remote.getGlobal('service').WindowManages,
    DestroyTargetWin: masterModules.electron.remote.getGlobal('service').DestroyTargetWin,
    AppReset        : masterModules.electron.remote.getGlobal('service').AppReset,
    SignOut         : masterModules.electron.remote.getGlobal('service').SignOut,
    Config          : masterModules.electron.remote.getGlobal('service').Config,
    SelectFiles     : masterModules.electron.remote.getGlobal('service').SelectFiles,

    // 服务端代理
    ServerProxy      : masterModules.electron.remote.getGlobal('service').ServerProxy,
    ServerProxyUpload: masterModules.electron.remote.getGlobal('service').ServerProxyUpload,
    ClientCache      : masterModules.electron.remote.getGlobal('service').ClientCache,

    // Process
    Process: masterModules.electron.remote.getGlobal('service').Process,

    // Dialog
    Dialog: masterModules.electron.remote.dialog,

    // Menu
    Menu: masterModules.electron.remote.Menu,

    // MenuItem
    MenuItem: masterModules.electron.remote.MenuItem,

    // 关闭当前渲染线程窗口
    currentWindowClose: () => {
        const currentWindow = masterModules.electron.remote.getCurrentWindow();
        currentWindow.close();
        return false;
    },

    // 获取当前渲染线程的winHash值
    getCurrentWinHash: () => {
        let currentHash: string    = '';
        const currentWinId: number = masterModules.electron.remote.getCurrentWindow().id;
        const browserWindowList    = masterModules.electron.remote.getGlobal('service').browserWindowList();
        for (const key in browserWindowList) {
            if (browserWindowList[key].id === currentWinId) {
                currentHash = key;
            }
        }
        return currentHash;
    },

    // 获取指定winHash的BrowserWindow对象
    getWindow: (windowHash: string): any => {

        const currentWinId: number = masterModules.electron.remote.getCurrentWindow().id;
        const browserWindowList    = masterModules.electron.remote.getGlobal('service').browserWindowList();
        if (!browserWindowList[windowHash]) {
            return false;
        }
        const targetWinId: number = browserWindowList[windowHash].id;
        if (currentWinId !== targetWinId) {
            return browserWindowList[windowHash];
        } else {
            return false;
        }
    },

    // 渲染进程对渲染进程的通信
    RenderToRender: {

        emit   : masterModules.electron.remote.getGlobal('service').RenderToRender.emit,
        subject: (eventName: string, callback: any) => {
            masterModules.electron.ipcRenderer.on(eventName, (event: any, params: object) => {
                console.log(eventName);
                return callback(event, params);
            });
        }
    }

};


export {Service};