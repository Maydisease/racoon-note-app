import * as React from 'react';
import {EventEmitter} from '../../services/events.service';
import {ArticleService} from '../../services/article.service';
import {Service} from '../../../../lib/master.electron.lib';
import {request} from '../../services/requst.service';
import {store} from '../../../../store';
import {storeSubscribe} from '../../../../store/middleware/storeActionEvent.middleware';
import {connect} from 'react-redux';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import SharePanel from './sharePanel';
import ArticleItems from './articleItems';

class ListComponent extends React.Component {

	public state: any = {
		inputFocusState: false,
		clearInputBtnState: false,
		quickSearchType: 0, // 0 title 1 article
		quickSearchResTotal: 0,
		isUseQuickSearch: false,
		from: {
			searchKeys: {
				value: ''
			}
		},

		currentCid: null,
		articleList: [],
		articleObj: null,
		sharePanelPos: {
			x: 0,
			y: 0
		},
		sharePanelState: false,
		shareInfo: {}
	};

	public listContextMenu: any;
	public quickSearchContextMenu: any;
	public quickSearchTimer: number;
	public articleService: ArticleService;
	public searchElement: React.RefObject<HTMLInputElement>;
	public articleListElementRef: React.RefObject<HTMLDivElement>;

	constructor(props: any) {
		super(props);
		this.articleService = new ArticleService();
		this.handleInputActive = this.handleInputActive.bind(this);
		this.handleInputClick = this.handleInputClick.bind(this);
		this.handleSearchValueChange = this.handleSearchValueChange.bind(this);
		this.handleInputKeyDown = this.handleInputKeyDown.bind(this);
		this.clearSearchKeys = this.clearSearchKeys.bind(this);
		this.getArticleList = this.getArticleList.bind(this);
		this.handleItemClick = this.handleItemClick.bind(this);
		this.removeNote = this.removeNote.bind(this);
		this.clearItemSelectedState = this.clearItemSelectedState.bind(this);
		this.handleItemContextMenu = this.handleItemContextMenu.bind(this);
		this.handleQuickSearchContextMenu = this.handleQuickSearchContextMenu.bind(this);
		this.quickSearchContextMenuInit = this.quickSearchContextMenuInit.bind(this);
		this.closeSharePanel = this.closeSharePanel.bind(this);
		this.updateShareInfo = this.updateShareInfo.bind(this);
		this.dragStartHandle = this.dragStartHandle.bind(this);
		this.dragEndHandle = this.dragEndHandle.bind(this);
		this.listContextMenu = new Service.Menu();
		this.quickSearchContextMenu = new Service.Menu();
		this.searchElement = React.createRef();
		this.articleListElementRef = React.createRef();
		this.listContextMenuInit();
		this.quickSearchContextMenuInit();
	}

	// listContextMenu初始化
	public listContextMenuInit() {

		const $this: this = this;

		this.listContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'S',
			label: 'Share Note', click() {
				$this.shareNote()
			}
		}));

		this.listContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'L',
			label: 'Lock Note', click() {
				$this.lockNote()
			}
		}));

		this.listContextMenu.append(new Service.MenuItem({type: 'separator'}));

		this.listContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'T',
			label: 'Move To Trash', click() {
				$this.removeNote()
			}
		}));

	}

	public shareNote() {
		const state: any = this.state;
		state.sharePanelState = true;
		this.setState(state);
		this.setSharePanelPos();
	}

	public closeSharePanel() {
		const state: any = this.state;
		state.sharePanelState = false;
		this.setState(state);
		this.UpdateArticleListDom(this.state.currentCid);
	}

	// 设置ICON面板的位置
	public setSharePanelPos() {
		setTimeout(() => {
			const listElement = document.getElementById(`list_element_${this.state.articleObj.id}`) as HTMLElement | any;
			const state = this.state;
			state.sharePanelPos.y = listElement.getBoundingClientRect().top;
			state.sharePanelPos.x = listElement.offsetLeft;
			this.setState(state);
		}, 0);
	}


	// 更改快速搜索的类型
	public changeQuickSearchType(type: number) {
		const state = this.state;
		state.quickSearchType = type;
		this.setState(state);
		this.quickSearchEvent();
	}

	// listContextMenu初始化
	public quickSearchContextMenuInit() {

		const $this: this = this;

		this.quickSearchContextMenu.append(
			new Service.MenuItem({
				type: 'radio', label: 'search title', click() {
					$this.changeQuickSearchType(0);
				}
			})
		);

		this.quickSearchContextMenu.append(new Service.MenuItem(
			{
				type: 'radio',
				label: 'search content', click() {
					$this.changeQuickSearchType(1);
				}
			}
		));

	}

	public async removeNote() {
		Service.Dialog.showMessageBox({
				title: 'Move To Trash',
				type: 'question',
				message: 'Move To Trash',
				detail: 'Are you sure you want to move this note to the trash?',
				defaultId: 0,
				cancelId: 1,
				buttons: ['Yes', 'Cancel']
			}
		).then(async (result: any) => {
			const btnIndex: number = result.response;
			if (btnIndex === 0) {
				const articleId = this.state.articleObj.id;
				const response = await request('note', 'setArticleDisableState', {id: articleId, disable: 1});

				if (response.result !== 1) {

					store.dispatch({
						type: 'NOTE$SELECTED_ARTICLE'
					});

					store.dispatch({
						type: 'NOTE$CLEAR_ARTICLE'
					});

					store.dispatch({
						type: 'NOTE$CLEAR_ARTICLE_TEMP'
					});

					await this.UpdateArticleListDom(this.state.currentCid);
				}
			}
		});
	}

	// 锁定文章
	public async lockNote() {
		const articleId = this.state.articleObj.id;
		const response = await request('note', 'setArticleLockState', {id: articleId, lock: 1});
		if (response.result === 0) {
			await this.UpdateArticleListDom(this.state.currentCid);
			this.handleItemClick(this.state.articleObj, true);
		}
	}

	// 解锁文章
	public async unLockNote() {
		await this.UpdateArticleListDom(this.state.currentCid);
		this.handleItemClick(this.state.articleObj, true);
	}

	// 清空搜索关键词
	public clearSearchKeys() {
		const state = this.state;
		state.from.searchKeys.value = '';
		state.clearInputBtnState = false;
		state.inputFocusState = false;
		this.setState(state);
		this.quickSearchEvent();
		store.dispatch({
			type: 'NOTE$UN_SEARCH_TAG'
		});
		if (this.state.quickSearchType === 1) {
			this.getQuickSearchDataList();
		}
	}

	// 搜索表单输入时的按下监听
	public handleInputKeyDown(event: KeyboardEventInit) {
		const keys = this.state.from.searchKeys.value;

		// 快捷键 Ctrl + Backspace 清除搜索关键字
		if (event.key === 'Backspace' && event.shiftKey && keys) {
			const element = (this.searchElement.current as HTMLInputElement);
			element.blur();
			this.clearSearchKeys();
		}
	}

	// 表单修改时的数据同步
	public handleSearchValueChange(event: React.ChangeEvent<HTMLInputElement>) {

		const state = this.state;
		state.clearInputBtnState = event.target.value.length > 0;
		state.from[event.target.name].value = event.target.value;
		this.setState(state);

		if (this.quickSearchTimer) {
			clearTimeout(this.quickSearchTimer)
		}

		this.quickSearchTimer = window.setTimeout(async () => {
			this.quickSearchEvent();
		}, 200)
	}

	// 快速搜索
	public async getQuickSearchDataList() {

		const keys = this.state.from.searchKeys.value;
		const cid = this.state.currentCid;
		const state = this.state;

		if (!keys && cid) {
			state.quickSearchResTotal = 0;
			await this.UpdateArticleListDom(cid);
			this.setState(state);
			return;
		}

		const response = await request('note', 'getQuickSearchDataList', {keys, cid});

		if (response.result === 0) {
			state.articleList = response.data;
			state.quickSearchResTotal = state.articleList.length;
		}

		if (state.articleList) {
			state.articleList.map((item: any, index: number) => {
				const title = state.articleList[index].title;
				const regx = new RegExp(`(${keys})`, 'ig');
				state.articleList[index].title = title.replace(regx, '<em>$1</em>');
				state.articleList[index].selected = false;
			});
			state.isUseQuickSearch = true;
			state.articleObj = {};

			store.dispatch({
				type: 'NOTE$SELECTED_ARTICLE'
			});

			store.dispatch({
				type: 'NOTE$CLEAR_ARTICLE'
			});

			store.dispatch({
				type: 'NOTE$CLEAR_ARTICLE_TEMP'
			});
		}

		this.setState(state);

	}

	// 全局搜索事件
	public quickSearchEvent() {
		switch (this.state.quickSearchType) {
			case 0:
				store.dispatch({
					type: 'NOTE$UN_SEARCH_TAG'
				});
				this.getQuickSearchDataList();
				break;
			case 1:
				store.dispatch({
					type: 'NOTE$QUICK_SEARCH',
					playload: {quickSearchKey: this.state.from.searchKeys.value}
				});
				break;
		}
	}

	// 搜索框聚焦/onFocus失焦/onBlur事件
	public async handleInputActive(sourceState: boolean) {
		const state = this.state;
		state.inputFocusState = !(!sourceState && this.state.from.searchKeys.value.length === 0);
		this.setState(state);
	}

	// 切换搜索框搜索的类型
	public handleInputClick() {
		const nextTypeStatus = this.state.quickSearchType === 0 ? 1 : 0;
		const state = this.state;
		state.quickSearchType = nextTypeStatus;
		const item = this.quickSearchContextMenu.items;
		const menuIndex = nextTypeStatus === 0 ? 0 : 1;
		item[menuIndex].checked = true;
		this.setState(state);

	}

	// 更新文章列表
	public async UpdateArticleListDom(cid: number) {
		const state = this.state;
		state.currentCid = cid;
		state.articleList = await this.getArticleList(cid);
		if (state.articleList) {
			state.articleList.map((item: any, index: number) => {
				state.articleList[index].selected = false;
			});
		}

		if (this.state.articleObj) {
			const index = state.articleList.findIndex((sourceItem: any) => this.state.articleObj.id === sourceItem.id);
			if (state.articleList[index]) {
				state.articleList[index].selected = true;
			}
		}

		this.setState(state);

	}

	public async componentDidMount() {

		// 监听categoryComment组件传递过来的选中事件
		if (!EventEmitter.listenerCount('selectedCategory')) {
			EventEmitter.addListener('selectedCategory', async (cid: number) => {
				if (this.state.from.searchKeys.value && this.state.quickSearchType === 0) {
					const state = this.state;
					state.currentCid = cid;
					this.setState(state);
					this.quickSearchEvent();
				} else {
					await this.UpdateArticleListDom(cid);
				}
			});
		}

		// 监听categoryComment传递过来的创建日志事件
		if (!EventEmitter.listenerCount('createdNote')) {
			EventEmitter.on('createdNote', async (cid: number) => {
				await this.UpdateArticleListDom(cid);
			});
		}

		// 监听监听articleComment传递过来的保存日志事件
		storeSubscribe('NOTE$SAVE_ARTICLE', async (action: any) => {
			await this.UpdateArticleListDom(this.state.currentCid);
		});

		storeSubscribe('NOTE$UN_SEARCH_TAG', () => {
			console.log('NOTE$UN_SEARCH_TAG');
			console.log(this.state.quickSearchType);
			if (this.state.quickSearchType === 1) {
				const state = this.state;
				state.from.searchKeys.value = '';
				state.clearInputBtnState = false;
				state.inputFocusState = false;
				this.setState(state);
			}
		});

		// 监听articleComponent传递过来的解锁日志事件
		storeSubscribe('NOTE$UNLOCK_ARTICLE', (action: any) => {
			this.unLockNote();
		});

		// 监听移动文章至指定分类的事件
		storeSubscribe('NOTE$MOVE_LIST_ARTICLE_TASK', async (action: any) => {
			const cid = this.state.currentCid;
			await this.UpdateArticleListDom(cid);
		});

		storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_F', async (action: any) => {
			const element = (this.searchElement.current as HTMLInputElement);
			if (element === document.activeElement) {
				element.blur();
				this.handleInputActive(false);
			} else {
				element.focus();
				this.handleInputActive(true);
			}
		});

		// 订阅搜索页面发送过来的选择搜索结果双击事件
		Service.RenderToRender.subject('search@superSearchSelectedList', async (event: any, params: any): Promise<boolean | void> => {
			store.dispatch({'type': `NOTE$CHANGE_TRASH_MODE_STATE`, playload: {trashMode: false}});
			const cid = params.data.cid;
			const id = params.data.id;
			await this.UpdateArticleListDom(cid);
			const key = await this.state.articleList.findIndex((sourceItem: any) => sourceItem.id === id);
			await this.handleItemClick(this.state.articleList[key]);
			const articleListElement = this.articleListElementRef.current as HTMLDivElement;
			const selectedItemElement = articleListElement.querySelector('.item.current') as HTMLDivElement;
			articleListElement.scrollTop = selectedItemElement.offsetTop - (selectedItemElement.clientHeight / 2);
		});

	}

	// 获取文章列表
	public async getArticleList(cid: number) {
		const response = await request('note', 'getArticleList', {cid});
		if (response.result !== 1) {
			return response.data;
		} else {
			return [];
		}
	}

	// 清除文章选中状态
	public clearItemSelectedState() {
		const state = this.state;
		state.articleList.some((item: any, index: number): any => {
			if (item.selected) {
				state.articleList[index].selected = false;
				return false;
			}
		});
		this.setState(state);
	}

	// 获取文章详情
	public async getArticleData(id: number) {
		const response = await request('note', 'getArticleData', {id});
		if (response.result !== 1) {
			return response.data;
		} else {
			return [];
		}
	}

	public updateShareInfo(item: any) {
		const state = this.state;
		const key = state.articleList.findIndex((sourceItem: any) => item.id === sourceItem.id);
		state.shareInfo = {
			aid: state.articleList[key].id,
			share_code: state.articleList[key].share_code,
			on_share: state.articleList[key].on_share,
			use_share_code: state.articleList[key].use_share_code
		};
		this.setState(state);
	}

	// 文章列表被点击
	public async handleItemClick(item: any, forceUpdate: boolean = false, e?: any): Promise<boolean | void> {

		const state = this.state;
		const key = state.articleList.findIndex((sourceItem: any) => item.id === sourceItem.id);

		if (!forceUpdate && this.state.articleObj && item.id === this.state.articleObj.id && state.articleList[key].selected) {
			return false;
		}

		// 清除文章列表被选中的item
		this.clearItemSelectedState();

		state.articleList[key].selected = true;
		state.articleObj = item;
		state.shareInfo = {
			aid: state.articleList[key].id,
			share_code: state.articleList[key].share_code,
			on_share: state.articleList[key].on_share,
			use_share_code: state.articleList[key].use_share_code,
			share_address: state.articleList[key].share_address
		};
		this.setState(state);

		let response;

		response = await Service.ClientCache('/note/article').getArticle(item.id);

		// 使用文章列表缓存机制
		if (!response) {
			response = await this.getArticleData(item.id);
			await Service.ClientCache('/note/article').addArticle(response);
		} else
			if ((response.updateTime < item.updateTime) || forceUpdate) {
				response = await this.getArticleData(item.id);
				await Service.ClientCache('/note/article').updateArticle(item.id, response);
			}

		// 更新store中NOTE内的文章字段组
		store.dispatch({
			type: 'NOTE$UPDATE_ARTICLE',
			playload: {
				id: response.id,
				cid: response.cid,
				title: response.title,
				lock: response.lock,
				markdown_content: response.markdown_content,
				html_content: response.html_content
			}
		});

		// 更新store中NOTE内的临时文章字段组
		store.dispatch({
			type: 'NOTE$UPDATE_ARTICLE_TEMP',
			playload: {
				title: response.title,
				markdown_content: response.markdown_content,
				html_content: response.html_content
			}
		});

		// 发送列表文章选中事件
		store.dispatch({type: 'NOTE$SELECTED_ARTICLE'});

	}

	// 被响应的文章列表右键上下文菜单事件
	public handleItemContextMenu(item: any, e?: any) {
		if (item.selected) {

			const items = this.listContextMenu.items;

			/**
			 *
			 * list context menu index
			 *
			 * items[0] -> Share Note
			 * items[1] -> Lock Note
			 * items[2] -> Move To Trash
			 *
			 */

			switch (item.lock) {
				case 0:
					items[0].enabled = true;
					items[1].enabled = true;
					break;
				case 1:
					items[0].enabled = false;
					items[1].enabled = false;
					break;
			}

			this.listContextMenu.popup({window: Service.getWindow('master')});
		}
	}

	// 被响应的搜索分类选择上下文菜单事件
	public handleQuickSearchContextMenu() {
		this.quickSearchContextMenu.popup({window: Service.getWindow('master')});
	}

	// 当文章列表被拖拽时（应用于拖拽移动分类功能）
	public dragStartHandle(event: React.DragEvent): void | boolean {
		const selfElement = event.target as HTMLElement;
		const {id, cid, lock} = selfElement.dataset;

		if (Number(lock) === 1) {
			selfElement.setAttribute('draggable', 'false');
			event.stopPropagation();
			event.preventDefault();
			return false;
		}

		const categoryListElement = document.querySelector('.category-list') as HTMLElement;
		const topElement = selfElement.closest('.item') as HTMLElement;
		categoryListElement.classList.add('drop');
		topElement.classList.add('draging');
		const params = JSON.stringify(
			{
				source: 'articleList',
				currentCid: cid,
				currentAid: id,
				currentLock: lock
			}
		);
		event.dataTransfer.setData('params', params);
	}

	// 当文章列表被拖拽结束时（应用于拖拽移动分类功能）
	public dragEndHandle(event: React.DragEvent) {
		const selfElement = event.target as HTMLElement;
		const topElement = selfElement.closest('.item') as HTMLElement;
		const categoryListElement = document.querySelector('.category-list');
		topElement.classList.remove('draging');
		if (categoryListElement) {
			categoryListElement.classList.remove('drop');
		}
	}

	public render() {

		const STORE_NOTE$FRAME = (this.props as any).STORE_NOTE$FRAME;

		return (
			<div className={`listContainer ${STORE_NOTE$FRAME.layout === 1 ? 'show' : ''} ${(STORE_NOTE$FRAME.trashMode || STORE_NOTE$FRAME.linkMode) ? 'hide' : ''}`}>

				{/* 快速搜索组件 */}
				<div className="searchContainer">
					<div className={`wrap ${this.state.inputFocusState && 'focus'}`}>
						<div className={`formBox ${this.state.inputFocusState && 'focus'}`}>
							<label onDoubleClick={this.handleInputClick.bind(true)}>
								<FontAwesomeIcon className="searchIcon fa-icon" icon="search"/>
							</label>
							<input
								ref={this.searchElement}
								name="searchKeys"
								type="text"
								value={this.state.from.searchKeys.value}
								onFocus={this.handleInputActive.bind(this, true)}
								onBlur={this.handleInputActive.bind(this, false)}
								placeholder="Search Notes"
								onChange={this.handleSearchValueChange}
								onKeyDown={this.handleInputKeyDown}
							/>
							<label className="searchResTotalNum" style={{display: this.state.quickSearchResTotal ? 'block' : 'none'}}>
								<span>{this.state.quickSearchResTotal}</span>
							</label>
							<label className="clearIcon" onClick={this.clearSearchKeys} style={{display: this.state.clearInputBtnState ? 'block' : 'none'}}>
								<FontAwesomeIcon className="clearSearchKey fa-icon" icon="times-circle"/>
							</label>
						</div>
						<div className="searchTypeIcon" onClick={this.handleQuickSearchContextMenu}>
							<FontAwesomeIcon className="fa-icon" icon={this.state.quickSearchType === 0 ? 'file' : 'file-alt'}/>
						</div>
					</div>
				</div>

				{/* 文章列表组件 */}
				<div className="article-list" ref={this.articleListElementRef}>
					<ArticleItems
						articleObj={this.state.articleObj ? this.state.articleObj : {}}
						articleList={this.state.articleList}
						handleItemContextMenu={this.handleItemContextMenu}
						handleItemClick={this.handleItemClick}
						dragStartHandle={this.dragStartHandle}
						dragEndHandle={this.dragEndHandle}
					/>
				</div>

				{/*分类ICON选择面板组件*/}
				<SharePanel
					key={this.state.shareInfo.aid}
					shareInfo={this.state.shareInfo}
					pos={this.state.sharePanelPos}
					show={this.state.sharePanelState}
					cancelEvent={this.closeSharePanel}
				/>
			</div>
		);
	}
}

export default connect((state: any) => state)(ListComponent);
