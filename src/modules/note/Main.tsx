import * as React from 'react';
import ArticleComponent from './components/article';
import TrashArticleComponent from './components/trash';
import LinkModuleComponent from '../book_mark/Main';
import CategoryComponent from './components/category';
import ListComponent from './components/list';
import {storeSubscribe} from '../../store/middleware/storeActionEvent.middleware';
import {Service} from '../../lib/master.electron.lib';
import {request} from './services/requst.service';
import './interface/service.interface';

class NoteMain extends React.Component {

	public state: any = {
		isTrashMode: false,
		isLinkMode: false
	};

	constructor(props: any) {
		super(props);
	}

	// 写入远端用户数据至本地存储作为缓存使用（静默）
	public async pullUserAllArticleToClientCache() {
		let localArticleIds: number[] = [];
		localArticleIds = await Service.ClientCache('/note/article').getUserAllArticleIds();
		const response = await request('note', 'getUserAllArticle', {ids: localArticleIds});
		if (response.result === 0 && response.data && response.data.length > 0) {
			// 分页存储（解决sqlite3因批量插入太多数据导致无法正常写入的问题）
			const pagNumber = 5;
			const loopPutCount: number = Math.ceil(response.data.length / pagNumber);
			for (let i = 0; i < loopPutCount; i++) {
				let newList = [];
				const currentIndex = i * pagNumber;
				if (i === loopPutCount) {
					newList = response.data.slice(currentIndex, response.data.length)
				} else {
					newList = response.data.slice(currentIndex, currentIndex + pagNumber);
				}
				Service.ClientCache('/note/article').addUserAllArticle(newList);
			}
		}
	}

	public noteInit() {
		this.pullUserAllArticleToClientCache();
	}

	public componentDidMount(): void {
		this.noteInit();

		storeSubscribe('NOTE$CHANGE_TRASH_MODE_STATE', (action: any) => {
			try {
				const state = this.state;
				state.isTrashMode = action.playload.trashMode;
				this.setState(state);
			} catch (e) {
				console.log(e);
			}
		});

		storeSubscribe('NOTE$CHANGE_LINK_MODE_STATE', (action: any) => {
			try {
				const state = this.state;
				state.isLinkMode = action.playload.linkMode;
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
				{this.state.isTrashMode && !this.state.isLinkMode && <TrashArticleComponent/>}
				{this.state.isLinkMode && <LinkModuleComponent/>}
			</div>
		);
	}
}

export default NoteMain;
