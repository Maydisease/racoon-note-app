import * as React            from 'react';
import ArticleComponent      from './components/article';
import TrashArticleComponent from './components/trash';
import CategoryComponent     from './components/category';
import ListComponent         from './components/list';
import './interface/service.interface';
import {storeSubscribe}      from "../../store/middleware/storeActionEvent.middleware";

class NoteMain extends React.Component {

    public state: any = {
        isTrashMode: false
    };

    constructor(props: any) {
        super(props);
    }

    public componentDidMount(): void {
        storeSubscribe('NOTE$CHANGE_TRASH_MODE_STATE', (action: any) => {
            try {
                const state       = this.state;
                state.isTrashMode = action.playload.trashMode;
                this.setState(state);
            } catch (e) {
                console.log(e);
            }
        });
    }

    public render() {
        return (
            <div id="noteMain">

                <CategoryComponent/>
                <ListComponent/>
                <ArticleComponent/>

                {
                    this.state.isTrashMode &&
					<TrashArticleComponent/>
                }

            </div>
        );
    }
}

export default NoteMain;
