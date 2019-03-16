import * as React        from 'react';
import ArticleComponent  from './components/article';
import CategoryComponent from './components/category';
import ListComponent     from './components/list';
import './interface/service.interface';
import {Service}         from '../../lib/master.electron.lib';
import {store}           from "../../store";
import {storeSubscribe}  from "../../store/middleware/storeActionEvent.middleware";

class NoteMain extends React.Component {

    public searchClass: any;
    public searchWin: any;

    constructor(props: any) {
        super(props);
    }

    public componentDidMount() {

        Service.IPCRenderer.on('windowKeyboard', (event: any, arg: any) => {
            store.dispatch({'type': `WINDOW_KEYBOARD$${arg}`});
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_SHIFT_F', () => {

            if (!Service.IPCRenderer.sendSync('getBrowserWindowList').search) {
                this.searchClass = new Service.WindowManages.search(true);
                this.searchWin   = this.searchClass.created();
            } else {
                if (this.searchWin && !this.searchWin.isDestroyed()) {

                    if (this.searchWin.isVisible()) {
                        this.searchWin.hide();
                        Service.Remote.getCurrentWindow().focus();
                    } else {
                        this.searchWin.show();
                    }

                }
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
