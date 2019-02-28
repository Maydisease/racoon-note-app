import * as React        from 'react';
import ArticleComponent  from './components/article';
import CategoryComponent from './components/category';
import ListComponent     from './components/list';
import './interface/service.interface';
// import '../../core/init/windowMenus.init';
import {Service}         from '../../lib/master.electron.lib';
import {store}           from "../../store";
import {storeSubscribe}  from "../../store/middleware/storeActionEvent.middleware";

class NoteMain extends React.Component {

    public searchWin: any;

    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {
        console.log('componentDidMount');

        Service.IPCRenderer.on('windowKeyboard', (event: any, arg: any) => {
            console.log(`WINDOW_KEYBOARD$${arg}`);
            store.dispatch({'type': `WINDOW_KEYBOARD$${arg}`});
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_SHIFT_F', () => {

            console.log(Service.IPCRenderer.sendSync('getBrowserWindowList'));

            if (!Service.IPCRenderer.sendSync('getBrowserWindowList').search) {
                console.log('进来了');
                this.searchWin = new Service.WindowManages.search(true);
                this.searchWin.created();
            } else {
                this.searchWin.destroy();
            }

        });
    }

    public render() {
        return (
            <div id="noteMain">
                <CategoryComponent/>
                <ListComponent/>
                <ArticleComponent/>
            </div>
        );
    }
}

export default NoteMain;
