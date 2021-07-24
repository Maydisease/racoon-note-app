import * as React from 'react';
import './style.scss';
import DynamicComponent from '../../services/dynamic_component';
import {ObserverEvent} from '../../services/observer.service';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Service} from '../../lib/master.electron.lib';
import {request} from '../note/services/requst.service';
import {VMessageService} from '../component/message';
import {store} from '../../store';
import {BookMarkCacheService} from './service';

// import history from '../../services/route_history.service';


interface LinkItem {
	id: number;
	title: string;
	url: string;
	cid: number;
	summary: string;
	tags: Array<{
		id: number;
		name: string;
	}>;
	updateTime: string;
	inputTime: string;
}

type GetLinkList = Array<{
	id: number;
	name: string;
	uid: string;
	updateTime: string;
	inputTime: string;
	links: LinkItem[]
}>

interface GetLinkListResponse {
	data: GetLinkList;
	message: string;
	messageCode: number;
	result: boolean;
}

interface AddLinkResponse {
	data: any;
	message: string;
	messageCode: number;
	result: boolean;
}

interface UpdateLinkResponse {
	data: any;
	message: string;
	messageCode: number;
	result: boolean;
}

interface IState {
	linkList: GetLinkList;
	tempCategoryReadyAddName: string;
	categoryCreateMode: boolean;
	openSidebarState: boolean;
	categorySelectState: boolean;
}

interface UseLinkIdFindLinkItemReturn {
	cateIndex: number,
	cateId: number,
	linkId: number,
	linkIndex: number,
	item: LinkItem | {}
}

class BookMain extends React.Component<any, IState> {
	public state: IState = {
		linkList: [],
		tempCategoryReadyAddName: '',
		categoryCreateMode: false,
		openSidebarState: false,
		categorySelectState: false
	}

	public categoryContextMenu: any;
	public linkItemContextMenu: any = undefined;

	public selectedLinkItemId: number | null = null;
	public selectedCategoryItemId: number | null = null;
	public categoryInputElementRef = React.createRef<HTMLInputElement>();
	public bookMarkCacheService: BookMarkCacheService = new BookMarkCacheService();

	constructor(props: any) {
		super(props);
		this.categoryContextMenu = new Service.Menu();
		this.linkItemContextMenu = new Service.Menu();
		this.openLink = this.openLink.bind(this);
		this.openSidebar = this.openSidebar.bind(this);
		this.addLinkItem = this.addLinkItem.bind(this);
		this.goBackNote = this.goBackNote.bind(this);
		this.changeCategoryCreateModeHandle = this.changeCategoryCreateModeHandle.bind(this);
		this.openLinkItemContextMenuHandel = this.openLinkItemContextMenuHandel.bind(this);
		this.openCategoryContextMenuHandel = this.openCategoryContextMenuHandel.bind(this);
		this.tempCategoryReadyAddNameHandle = this.tempCategoryReadyAddNameHandle.bind(this);
		this.createCategoryContextmenuHandle = this.createCategoryContextmenuHandle.bind(this);
		this.tempCategoryReadyAddNameKeyDownHandle = this.tempCategoryReadyAddNameKeyDownHandle.bind(this);
	}

	public goBackNote() {
		const linkMode = !store.getState().STORE_NOTE$FRAME.linkMode;
		store.dispatch({'type': `NOTE$CHANGE_LINK_MODE_STATE`, playload: {linkMode}});
	}

	public openSidebar() {
		const state = this.state;
		state.openSidebarState = !state.openSidebarState;
		this.setState(state);
	}

	public openLink(link: string) {
		Service.Dialog.showMessageBox({
				title: 'GoToLink',
				type: 'question',
				message: 'Open this link',
				detail: `Do you open '${link}' in your browser?`,
				defaultId: 0,
				cancelId: 1,
				buttons: ['Yes', 'Cancel']
			}
		).then(async (result: any) => {
			const btnIndex: number = result.response;
			if (btnIndex === 0) {
				Service.Shell.openExternal(link);
			}
		});
	}

	public async getLinkList() {
		const response = await request('links', 'getLinkList') as GetLinkListResponse;

		if (response.data && response.data.length) {
			const state = this.state;
			state.linkList = response.data;
			this.setState(state);
		}
	}

	public async addLink(cid: number, title: string, url: string, summary: string, tags: string[]) {

		const response = await request('links', 'addLink', {
			cid,
			title,
			url,
			summary,
			tags
		}) as AddLinkResponse;

		return response;

	}

	public async updateLink(linkId: number, cid: number, title: string, url: string, summary: string, tags: string[]) {

		const response = await request('links', 'updateLink', {
			linkId,
			cid,
			title,
			url,
			summary,
			tags
		}) as UpdateLinkResponse;

		return response;

	}

	// categoryItem右键菜单初始化
	public categoryContextMenuInit() {

		this.categoryContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'A',
			label: 'Add Link',
			click: () => {
				this.addLinkItem(this.selectedCategoryItemId!);
			}
		}));

		this.categoryContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'R',
			label: 'Rename',
			click() {
				//
			}
		}));

		this.categoryContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'D',
			label: 'Delete',
			click: () => {
				this.removeCategory();
			}
		}));
	}

	// linkItem右键菜单初始化
	public linkItemContextMenuInit() {

		this.linkItemContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'D',
			label: 'Delete',
			click: () => {
				this.removeLinkItem();
			}
		}));

		this.linkItemContextMenu.append(new Service.MenuItem({
			enabled: true,
			accelerator: 'E',
			label: 'Edit',
			click: () => {
				this.updateLinkActionHandle(this.selectedLinkItemId!);
			}
		}));
	}

	public updateLinkActionHandle(linkId: number) {

		const linkList: GetLinkList = JSON.parse(JSON.stringify(this.state.linkList));
		const itemResult = this.useLinkIdFindLinkItem(linkList, this.selectedLinkItemId!);

		const comA: any = new DynamicComponent();
		comA.init(import('./dynamic_com/edit_link'), {
			edit: true,
			linkId,
			context: itemResult && itemResult.item || {}
		});
		comA.subscribe('submit', async (event: ObserverEvent) => {

			const {data} = event;
			const {title, url, summary, tags, cid} = data;

			const updateLinkResponse = await this.updateLink(linkId, cid, title, url, summary, tags);

			if (!(updateLinkResponse.messageCode === 2000)) {
				new VMessageService(updateLinkResponse.message, 'error', 3000).init();
				return;
			}

			const state = this.state;
			const updateCateDataIndex = this.state.linkList.findIndex((item) => item.id === updateLinkResponse.data.id);
			const updateLinkDataIndex = linkList[updateCateDataIndex].links.findIndex((item) => item.id === linkId);
			linkList[updateCateDataIndex].links[updateLinkDataIndex] = updateLinkResponse.data.links[0];
			state.linkList = linkList;
			this.setState(state);
			new VMessageService('Update link success', 'success', 3000).init();

			if (updateLinkResponse.data.isExistNewTag) {
				this.bookMarkCacheService.updateLocalTagCache();
			}

		});
	}

	public useLinkIdFindLinkItem(linkList: GetLinkList, linkId: number): UseLinkIdFindLinkItemReturn | false {

		const info: UseLinkIdFindLinkItemReturn = {
			cateIndex: 0,
			cateId: 0,
			linkId: 0,
			linkIndex: 0,
			item: {}
		}

		const checkIsExits = linkList.some((cateItem, cateItemIndex) => {
			return cateItem.links.some((linkItem, linkItemIndex) => {
				if (linkItem.id === linkId) {
					info.cateId = cateItem.id;
					info.linkId = linkItem.id;
					info.cateIndex = cateItemIndex;
					info.linkIndex = linkItemIndex;
					info.item = linkItem;
					return info;
				} else {
					return false;
				}
			})
		});
		return checkIsExits ? info : false;
	}

	// 移除指定item
	public async removeLinkItem() {
		Service.Dialog.showMessageBox({
				title: 'tips',
				type: 'question',
				message: 'Delete link',
				detail: `Are you sure you want to delete this link?`,
				defaultId: 0,
				cancelId: 1,
				buttons: ['Yes', 'Cancel']
			}
		).then(async (result: any) => {
			const btnIndex: number = result.response;

			if (btnIndex === 0) {
				const response = await request('links', 'removeLink', {
					linkId: this.selectedLinkItemId
				});

				if (!(response.messageCode === 2000 && response.data.linkId)) {
					new VMessageService(response.message, 'error', 3000).init();
					return;
				}

				const linkList: GetLinkList = JSON.parse(JSON.stringify(this.state.linkList));
				const itemResult = this.useLinkIdFindLinkItem(linkList, this.selectedLinkItemId!);

				if (itemResult) {
					linkList[itemResult.cateIndex].links.splice(itemResult.linkIndex, 1);
					const state = this.state;
					state.linkList = linkList;
					this.setState(state);
					new VMessageService('Remove link success', 'success', 3000).init();
				}
			}

		});


	}

	public componentDidMount() {
		this.getLinkList();
		// 初始化link item 的右键菜单
		this.linkItemContextMenuInit();
		// 初始化category 的右键菜单
		this.categoryContextMenuInit();
		//
		console.log(666601);

	}

	// 添加link
	public addLinkItem(cid: number) {

		console.log(cid);

		const comA: any = new DynamicComponent();
		comA.init(import('./dynamic_com/edit_link'), {});
		comA.subscribe('submit', async (event: ObserverEvent) => {

			const {data} = event;
			const {title, url, summary, tags} = data;

			const response: AddLinkResponse = await this.addLink(cid, title, url, summary, tags);


			if (!(response.messageCode === 2000)) {
				new VMessageService(response.message, 'error', 3000).init();
				return;
			}

			const state = this.state;
			const updateLinkDataIndex = this.state.linkList.findIndex((item) => item.id === response.data.id);
			const linkList = JSON.parse(JSON.stringify(state.linkList));
			linkList[updateLinkDataIndex].links.push(response.data.links[0]);
			state.linkList = linkList;
			this.setState(state);
			new VMessageService('Add a link success', 'success', 3000).init();

			if (response.data.isExistNewTag) {
				this.bookMarkCacheService.updateLocalTagCache();
			}

		});
	}

	// 打开cateItem的右键菜单
	public openCategoryContextMenuHandel(cid: number) {
		const state = this.state;
		state.categorySelectState = true;
		this.setState(state);
		this.selectedCategoryItemId = cid;
		this.categoryContextMenu.popup({window: Service.getWindow('master')});
		this.categoryContextMenu.once('menu-will-close', () => {
			console.log('close');
			state.categorySelectState = false;
			this.setState(state);
		});
	}

	// 打开linkItem的右键菜单
	public openLinkItemContextMenuHandel(linkId: number) {
		this.selectedLinkItemId = linkId;
		this.linkItemContextMenu.popup({window: Service.getWindow('master')});
		this.linkItemContextMenu.once('menu-will-close', () => {
			console.log('close');
		});
	}

	public async removeCategory() {
		Service.Dialog.showMessageBox({
				title: 'tips',
				type: 'question',
				message: 'Delete Category',
				detail: `Are you sure you want to delete this category?`,
				defaultId: 0,
				cancelId: 1,
				buttons: ['Yes', 'Cancel']
			}
		).then(async (result: any) => {
			const btnIndex: number = result.response;
			if (btnIndex === 0) {
				const response = await request('links', 'removeCategory', {
					cid: this.selectedCategoryItemId
				});
				if (response.messageCode === 2000) {
					const cid = response.data.cid;
					const removeCategoryFindItemIndex = this.state.linkList.findIndex((item) => item.id === cid);
					const linkList = JSON.parse(JSON.stringify(this.state.linkList));
					linkList.splice(removeCategoryFindItemIndex, 1);
					const state = this.state;
					state.linkList = linkList;
					this.setState(state);
					new VMessageService('remove category success', 'success', 3000).init();
				}
			}
		});
	}

	public async addCategory(categoryName: string) {
		const response = await request('links', 'addCategory', {
			name: categoryName
		});

		if (response.messageCode === 2000) {
			const state = this.state;
			state.linkList.push(response.data);
			this.setState(state);
			new VMessageService('add category success', 'success', 3000).init();
		}
	}

	public changeCategoryCreateModeHandle(changeType: 'in' | 'out') {
		const state = this.state;

		if (this.state.tempCategoryReadyAddName && changeType === 'out') {

			Service.Dialog.showMessageBox({
					title: 'tips',
					type: 'question',
					message: 'Add a Category',
					detail: `Are you sure you want to add this '${this.state.tempCategoryReadyAddName}' category`,
					defaultId: 0,
					cancelId: 1,
					buttons: ['Yes', 'Cancel']
				}
			).then(async (result: any) => {
				const btnIndex: number = result.response;

				if (btnIndex === 0) {
					this.addCategory(this.state.tempCategoryReadyAddName);
				}
				state.tempCategoryReadyAddName = '';
				state.categoryCreateMode = false;
				this.setState(state);
			});

			return;
		}

		state.categoryCreateMode = changeType === 'in';
		this.setState(state);
	}

	public createCategoryContextmenuHandle() {
		// const state = this.state;
		// state.categoryCreateMode = true;
		// this.setState(state);
		this.changeCategoryCreateModeHandle('in');
	}

	public tempCategoryReadyAddNameKeyDownHandle($event: React.KeyboardEvent<HTMLInputElement>) {
		// key enter code
		if ($event.keyCode === 13) {
			this.categoryInputElementRef.current?.blur();
		}
	}

	public tempCategoryReadyAddNameHandle($event: React.ChangeEvent<HTMLInputElement>) {
		console.log('asdasda', $event);
		const {name, value} = $event.target;
		const state = this.state;
		state[name] = value;
		this.setState(state);
	}

	public render() {
		return (
			<div id="book-mark-container">
				<div className="back-action" onClick={this.goBackNote}>
					back note
				</div>
				<div className="main">
					<div className="category-group">
						<div
							className={`category add-icon ${this.state.categoryCreateMode ? 'selected' : ''}`}
							onContextMenu={this.createCategoryContextmenuHandle}
						>
							<div className="icon-wrap">
								<label onClick={this.changeCategoryCreateModeHandle.bind(this, 'in')}>
									{
										!this.state.categoryCreateMode &&
										<>
											<FontAwesomeIcon className="fa-icon" icon="plus"/>
											<span>add a new category</span>
										</>
									}

									{
										this.state.categoryCreateMode &&
										<input
											type="text"
											autoFocus={true}
											ref={this.categoryInputElementRef}
											onKeyDown={this.tempCategoryReadyAddNameKeyDownHandle}
											name={'tempCategoryReadyAddName'}
											onChange={this.tempCategoryReadyAddNameHandle}
											placeholder="please enter category name"
											onBlur={this.changeCategoryCreateModeHandle.bind(this, 'out')}
										/>
									}
								</label>
							</div>
						</div>

						{
							this.state.linkList &&
							this.state.linkList.length > 0 &&
							// 遍历分类
							this.state.linkList.map((item, index) => {
								return <div key={item.id}>
									<div className={`category ${this.state.categorySelectState && this.selectedCategoryItemId === item.id ? 'selected' : ''}`} onContextMenu={this.openCategoryContextMenuHandel.bind(this, item.id)}>{item.name}</div>
									<div className="link-group">
										{
											item.links &&
											item.links.length > 0 &&
											// 遍历链接
											item.links.map((linkItem, linkIndex) => {
												return (
													<div className="item" key={linkItem.id} onContextMenu={this.openLinkItemContextMenuHandel.bind(this, linkItem.id)}>
														<div className="link"><span onClick={this.openLink.bind(this, linkItem.url)}>{linkItem.title}</span></div>
														<div className="tag">
															{
																linkItem.tags &&
																linkItem.tags.length > 0 &&
																// 遍历标签
																linkItem.tags.map((tagItem) => tagItem && tagItem.id && <span key={tagItem.id}>{tagItem.name}、</span>)
															}
														</div>
													</div>
												)
											})
										}
									</div>
								</div>
							})
						}
					</div>
				</div>
				{/*<div className='control-panel'>123</div>*/}
			</div>
		);
	}
}

export default BookMain;
