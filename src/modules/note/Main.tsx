import * as React            from 'react';
import ArticleComponent      from './components/article';
import TrashArticleComponent from './components/trash';
import CategoryComponent     from './components/category';
import ListComponent         from './components/list';
import {storeSubscribe}      from "../../store/middleware/storeActionEvent.middleware";
import {Service}             from "../../lib/master.electron.lib";
import {request}             from './services/requst.service';
import './interface/service.interface';

class NoteMain extends React.Component {

    public state: any = {
        isTrashMode: false
    };

    constructor(props: any) {
        super(props);
    }

    // 写入远端用户数据至本地存储作为缓存使用（静默）
    public async pullUserAllArticleToClientCache() {
        let localArticleIds: number[] = [];
        localArticleIds               = await Service.ClientCache('/note/article').getUserAllArticleIds();
        const response                = await request('note', 'getUserAllArticle', {ids: localArticleIds});
        if (response.result === 0 && response.data && response.data.length > 0) {
            await Service.ClientCache('/note/article').addUserAllArticle(response.data);
        }
    }

    public noteInit() {
        this.pullUserAllArticleToClientCache();
    }

    public componentDidMount(): void {
        this.noteInit();
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
                <div id="dynamic-container"/>
            </div>
        );
    }
}

export default NoteMain;
