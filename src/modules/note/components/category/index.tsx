import * as React                          from 'react';
import RenamePanel                         from './rename';
import CategoryIconPanel                   from './categoryIconPanel';
import CategoryTree                        from './categoryTree';
import {ArticleService}                    from "../../services/article.service";
import {EventEmitter}                      from "../../services/events.service";
import {Service}                           from "../../../../lib/master.electron.lib";
import {storeSubscribe}                    from "../../../../store/middleware/storeActionEvent.middleware";
import {VMessageService}                   from "../../../component/message";
import {FontAwesomeIcon}                   from '@fortawesome/react-fontawesome';
import {store}                             from "../../../../store";
import {request}                           from '../../services/requst.service';
import {AppCommandService}                 from "../../services/appCommand.service";
import {AttachedService, $AttachedService} from '../../services/window_manage/attached.server';

interface CategoryItemEdit {
    state: boolean,
    value: string,
}

interface CategoryItem {
    id: number,
    name: string,
    parent: number,
    selected?: boolean | undefined
    edit?: CategoryItemEdit | undefined
}

interface RenamePanelPos {
    x?: number,
    y?: number
}

interface CategoryIconPanelPos {
    x?: number,
    y?: number
}

interface IState {
    contextMenu: string,
    categoryObj: CategoryItem | any,
    categoryTree: any;
    categorySource: any;
    categoryElement: HTMLElement | null;
    isDidMount: boolean;
    renamePanelPos: RenamePanelPos,
    renamePanelState: boolean,
    categoryIconPanelState: boolean,
    renameValue: string,
    componentShowState: boolean,
    categoryIconPanelPos: CategoryIconPanelPos,
    selectedIcon: string,
    defaultIcon: string

}

class CategoryContainer extends React.Component {

    public contextMenu: any;

    public state: IState = {
        componentShowState    : true,
        contextMenu           : '',
        categoryObj           : {},
        categoryTree          : [],
        categorySource        : [],
        categoryElement       : null,
        isDidMount            : false,
        renamePanelPos        : {},
        renamePanelState      : false,
        renameValue           : '',
        categoryIconPanelPos  : {},
        categoryIconPanelState: false,
        selectedIcon          : 'folder',
        defaultIcon           : 'folder'
    };

    public categoryMenusElement: HTMLElement | any;

    public articleService: ArticleService;
    public appCommandService: AppCommandService;
    public attachedService: AttachedService;

    constructor(readonly props: any) {
        super(props);
        this.contextMenu = new Service.Menu();
        this.contextMenuInit();
        this.categoryMenusElement         = undefined;
        this.articleService               = new ArticleService();
        this.attachedService              = $AttachedService;
        this.appCommandService            = new AppCommandService();
        this.closeRenamePanel             = this.closeRenamePanel.bind(this);
        this.closeChangeCategoryIconPanel = this.closeChangeCategoryIconPanel.bind(this);
        this.confirmRenamePanel           = this.confirmRenamePanel.bind(this);
        this.setRenamePanelPos            = this.setRenamePanelPos.bind(this);
        this.setIconPanelPos              = this.setIconPanelPos.bind(this);
        this.handleActionBar              = this.handleActionBar.bind(this);
        this.changeCategoryIconEvent      = this.changeCategoryIconEvent.bind(this);
    }

    public async componentWillMount() {
        storeSubscribe('NOTE$CHANGE_FRAME_STATE', (action: any) => {
            const state: any         = this.state;
            state.componentShowState = action.playload.layout;
            this.setState(state);
        });
    }

    // 获取分类数据
    public async getCategoryData(): Promise<void> {
        const state: any = this.state;
        const response   = await request('note', 'getCategoryData');
        if (response.request !== 1 && response.data && response.data.length > 0) {
            state.categorySource = response.data;
        } else {
            state.categorySource = [];
        }
        this.setState(state);
    }

    // 更新分类dom
    public async updateCategoryDom() {
        await this.getCategoryData();
        this.categoryMenusEventBind();
    }

    public componentDidMount() {

        storeSubscribe('NOTE$CHANGE_TRASH_MODE_STATE', (action: any) => {
            if (!action.playload.trashMode && store.getState().STORE_NOTE$Task.isTrashCrush) {
                EventEmitter.emit('selectedCategory', this.state.categoryObj.id);
            }
        });

        const state: any = this.state;
        state.isDidMount = true;
        this.setState(state);
        this.updateCategoryDom();
    }

    // 关闭更名面板
    public closeRenamePanel(): void {
        const state: any       = this.state;
        state.renamePanelState = false;
        this.setState(state);
    }

    // 关闭ICON选择面板
    public async closeChangeCategoryIconPanel(): Promise<void> {
        const state: any             = this.state;
        state.categoryIconPanelState = false;
        const key                    = this.state.categorySource.findIndex((sourceItem: any) => sourceItem.id === this.state.categoryObj.id);
        const categorySource         = [...state.categorySource];

        if (this.state.categorySource[key].iconText !== this.state.selectedIcon) {
            categorySource[key].iconText = this.state.selectedIcon;
            const updateIconBody         = {
                id      : this.state.categoryObj.id,
                iconText: this.state.selectedIcon
            };

            const response = await request('note', 'updateCategoryIcon', updateIconBody);
            let msg        = '';
            let type: 'success' | 'error';
            if (response.result !== 1) {
                msg  = 'Change Category Icon success';
                type = 'success';

            } else {
                msg  = 'Change Category Icon fail';
                type = 'error';
            }
            new VMessageService(msg, type, 2000).init();
        }

        state.categorySource = categorySource;

        this.setState(state);
        this.categoryMenusEventBind();

    }

    // 更换category名确认面板事件
    public async confirmRenamePanel(newName: string): Promise<boolean | void> {
        if (newName !== '' && this.state.categoryObj.name !== newName) {

            const renameBody = {
                id    : this.state.categoryObj.id,
                parent: this.state.categoryObj.parent,
                newName
            };

            const response = await request('note', 'renameCategory', renameBody);

            // 当前父级分类下只允许一个同名子分类
            if (response.messageCode === 1010) {
                const msg = 'There is a brother of the same name';
                new VMessageService(msg, 'error', 5000).init();
                this.closeRenamePanel();
                return false;
            }

            // 分类更名成功
            if (response.result !== 1) {
                new VMessageService('Category renamed success', 'success', 3000).init();
                await this.updateCategoryDom();
                this.closeRenamePanel();
            }

        } else {
            new VMessageService('No changes have been made', 'common', 5000).init();
            this.closeRenamePanel();
        }

    }

    // 给所有分类菜单绑定事件
    public categoryMenusEventBind() {
        setTimeout(() => {
            const categoryList: HTMLElement = (document.querySelector('.category-list') as HTMLElement);

            // 清除已选中的dom状态
            const clearSelectedState = () => {
                categoryList.querySelectorAll('label').forEach((l) => {
                    if (l.getAttribute('current') === 'true') {
                        l.removeAttribute('current');
                    }
                });
            };

            const closest = (el: any, selector: any) => {
                const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

                while (el) {
                    if (matchesSelector.call(el, selector)) {
                        break;
                    }
                    el = el.parentElement;
                }
                return el;
            };

            // category分类menu节点事件处理(关闭/展开/选中)
            const categoryMenusEventBind = (event: MouseEvent, itemElement: HTMLElement, isContextMenu: boolean = false) => {

                clearSelectedState();
                const labelElement: HTMLElement = (itemElement.querySelector('label') as HTMLElement);
                labelElement.setAttribute('current', 'true');
                if (closest((event.target as HTMLElement), '.extension')) {
                    const isClose = !labelElement.getAttribute('close') || labelElement.getAttribute('close') === 'false';
                    labelElement.setAttribute('close', isClose ? 'true' : 'false');
                    (itemElement.querySelector('.extension') as HTMLElement).setAttribute('close', isClose ? 'true' : 'false');
                    (itemElement.querySelectorAll('.item') as NodeList).forEach((item: HTMLElement) => item.style.display = isClose ? 'none' : 'block')
                }

                const menuId       = Number(itemElement.getAttribute('data-menu-id'));
                const isTrashCrush = store.getState().STORE_NOTE$Task.isTrashCrush;

                if (isTrashCrush) {
                    store.dispatch({type: 'CLEAN_UPDATE_CATEGORY_TASK'})
                }

                if (menuId !== 0 && (!this.state.categoryObj) || isTrashCrush || (this.state.categoryObj && this.state.categoryObj.id !== menuId)) {
                    EventEmitter.emit('selectedCategory', menuId);
                }

                const state: any      = this.state;
                state.categoryObj     = this.state.categorySource.filter((item: any) => item.id === Number(menuId))[0];
                state.categoryElement = itemElement;

                if (menuId === 0) {
                    state.selectedIcon = 'folder';
                } else {
                    state.selectedIcon = (itemElement.querySelector('img') as HTMLElement).title;
                }

                this.setState(state);

                // 分类更名组件
                if (this.state.renamePanelState) {
                    this.closeRenamePanel();
                } else {
                    this.setRenamePanelPos();
                }

                // 分类图标组件
                if (this.state.categoryIconPanelState) {
                    this.closeChangeCategoryIconPanel();
                } else {
                    this.setIconPanelPos();
                }

                event.stopPropagation();
            };

            if (categoryList) {
                categoryList.querySelectorAll('.item:not(.independent)').forEach((itemElement: HTMLElement) => {

                    // 绑定鼠标左键
                    itemElement.onclick       = (event: MouseEvent) => {
                        if (store.getState().STORE_NOTE$FRAME.trashMode) {
                            store.dispatch({'type': `NOTE$CHANGE_TRASH_MODE_STATE`, playload: {trashMode: false}});
                            categoryMenusEventBind(event, itemElement);
                        } else {
                            categoryMenusEventBind(event, itemElement);
                        }
                    };
                    // 绑定鼠标右键
                    itemElement.oncontextmenu = (event: MouseEvent) => {
                        const isCurrent = (itemElement.querySelector('label') as HTMLElement).getAttribute('current') === 'true';
                        const isSuper   = itemElement.getAttribute('data-is-super') === '1';
                        if (isCurrent) {
                            // const isLast = itemElement.getAttribute('data-is-last');
                            const items = this.contextMenu.items;

                            // item[0] Add article;
                            // item[1] Created category;
                            // item[2] Rename category;
                            // item[3] Change icon;
                            // item[4] Separator;
                            // item[5] Remove category;

                            if (!this.state.categoryObj) {
                                items[0].enabled = false;
                                items[1].enabled = true;
                                items[2].enabled = false;
                                items[3].enabled = false;
                                items[4].enabled = false;
                                items[5].enabled = false;
                            } else {
                                items[0].enabled = true;
                                items[1].enabled = true;
                                items[2].enabled = true;
                                items[3].enabled = true;
                                items[4].enabled = true;
                                items[5].enabled = true;
                            }

                            if (isSuper) {
                                items[0].enabled = true;
                                items[1].enabled = false;
                                items[2].enabled = false;
                                items[3].enabled = false;
                                items[4].enabled = false;
                                items[5].enabled = false;
                            }

                            this.contextMenu.popup({window: Service.getWindow('master')});
                            categoryMenusEventBind(event, itemElement, true);
                        }
                    }
                });
            }

        }, 200);
    }

    // contextMenu初始化
    public contextMenuInit() {
        const $this: this = this;

        // item[0];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'A',
            label      : 'Add note', click() {
                $this.createdNote()
            }
        }));

        // item[1];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'N',
            label      : 'New category', click() {
                $this.createdCategory()
            }
        }));

        // item[2];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'R',
            label      : 'Rename category', click() {
                $this.renameCategory()
            }
        }));

        // item[3];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'I',
            label      : 'Change icon', click() {
                $this.changeCategoryIcon();
            }
        }));

        // item[4];
        this.contextMenu.append(new Service.MenuItem({type: 'separator'}));

        // item[5];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'D',
            label      : 'Remove category', click() {
                $this.removeCategory()
            }
        }));
    }

    // 创建文章
    public async createdNote() {
        const resState = await this.articleService.createdNote(this.state.categoryObj.id);
        if (resState) {
            EventEmitter.emit('createdNote', this.state.categoryObj.id);
        }
    }

    // 创建分类
    public async createdCategory() {
        let postfix          = String(new Date().getTime());
        postfix              = postfix.substring(postfix.length - 4, postfix.length);
        const name: string   = 'temp' + postfix;
        const parent: number = this.state.categoryObj ? this.state.categoryObj.id : 0;
        const response       = await request('note', 'addCategoryData', {parent, name});
        if (response.result !== 1) {
            await this.updateCategoryDom();
        }
    }

    // 删除分类
    public async removeCategory() {
        if (this.state.categoryObj) {
            Service.Dialog.showMessageBox({
                    title    : 'Delete this category',
                    type     : 'question',
                    message  : 'Delete this category',
                    detail   : 'Do you really want to delete this category?',
                    defaultId: 0,
                    cancelId : 1,
                    buttons  : ['Yes', 'Cancel']
                },
            ).then(async (result: any) => {
                const btnIndex: number = result.response;
                if (btnIndex === 0) {
                    const id       = this.state.categoryObj.id;
                    const response = await request('note', 'removeCategory', {id});

                    // 当前父级分类下只允许一个同名子分类
                    if (response.messageCode === 1013) {
                        const msg = 'Current category has subcategories!';
                        new VMessageService(msg, 'error', 3000).init();
                        this.closeRenamePanel();
                        return;
                    }

                    // 当前分类下有文章
                    if (response.messageCode === 1014) {
                        const msg = 'Current category has articles!';
                        new VMessageService(msg, 'error', 3000).init();
                        this.closeRenamePanel();
                        return;
                    }

                    if (response.result !== 1) {
                        await this.updateCategoryDom();
                    }
                }
            })

        }
    }

    // 修改分类名
    public renameCategory() {
        const state: any       = this.state;
        state.renamePanelState = false;
        if (this.state.categoryObj) {
            state.renamePanelState = true;
            state.renameValue      = this.state.categoryObj.name;
            this.setRenamePanelPos();
        }
        this.setState(state);
    }

    // 更改分类图标
    public changeCategoryIcon() {
        const state: any             = this.state;
        state.categoryIconPanelState = false;
        if (this.state.categoryObj) {
            state.categoryIconPanelState = true;
            this.setIconPanelPos();
        }
        this.setState(state);
    }

    // 设置分类更名面板的位置
    public setRenamePanelPos(): void {
        const categoryElement  = (this.state.categoryElement as HTMLElement);
        const state            = this.state;
        state.renamePanelPos.y = Number(categoryElement.getBoundingClientRect().top);
        this.setState(state as any);
    }

    // 设置ICON面板的位置
    public setIconPanelPos(): void {
        const categoryElement        = (this.state.categoryElement as HTMLElement);
        const {top}                  = categoryElement.getBoundingClientRect();
        const state                  = this.state;
        state.categoryIconPanelPos.y = Number(top);
        state.categoryIconPanelPos.x = (categoryElement.querySelector('.icon-2') as HTMLElement).offsetLeft;
        this.setState(state as any);
    }

    // 打开附件window
    public openAttached(): void {
        this.attachedService.open();
    }

    // 分类边栏下方的动作栏事件
    public handleActionBar(actionType: string): void {
        switch (actionType) {
            case 'setting':
                break;
            case 'search':
                store.dispatch({'type': `WINDOW_KEYBOARD$CMD_OR_CTRL_SHIFT_F`});
                break;
            case 'trash':
                const trashMode = !store.getState().STORE_NOTE$FRAME.trashMode;
                store.dispatch({'type': `NOTE$CHANGE_TRASH_MODE_STATE`, playload: {trashMode}});
                break;
            case 'attached':
                this.openAttached();
                break;
            case 'signOut':
                this.appCommandService.signOut();
                break;

        }
    }

    // 当ICON面板中ICON被点击后的事件
    public changeCategoryIconEvent(item: { icon: string }) {
        const state: any   = this.state;
        state.selectedIcon = item.icon;
        this.setState(state);
    }

    public render() {

        const isTrashMode = store.getState().STORE_NOTE$FRAME.trashMode;

        return (
            <div className={`categoryContainer ${this.state.componentShowState ? 'show' : ''}`}>
                <div className="wrap">
                    <div className="category-list">
                        <div className="item default" data-menu-id="0">
                            <label>
                                <span className={`icon icon-2`}>
                                    <FontAwesomeIcon className="fa-icon" icon="desktop"/>
                                </span>
                                <span className="text">Default</span>
                            </label>
                        </div>
                        {
                            this.state.categorySource &&
                            this.state.categorySource.length > 0 &&
                            // 分类树组件
							<CategoryTree
								data={this.state.categorySource}
							/>
                        }
                    </div>

                    {/*控制栏*/}
                    <div className="action-bar">
                        <label className={`left`} onClick={this.handleActionBar.bind(null, 'setting')}>
                            <FontAwesomeIcon className="fa-icon" icon="sliders-h"/>
                        </label>
                        <span className="line left"/>
                        <label className={`left`} onClick={this.handleActionBar.bind(null, 'search')}>
                            <FontAwesomeIcon className="fa-icon" icon="search"/>
                        </label>
                        <span className="line left"/>
                        <label className={`left`} onClick={this.handleActionBar.bind(null, 'attached')}>
                            <FontAwesomeIcon className="fa-icon" icon="paperclip"/>
                        </label>
                        <span className="line left"/>
                        <label className={`left ${isTrashMode ? 'active' : ''}`} onClick={this.handleActionBar.bind(null, 'trash')}>
                            <FontAwesomeIcon className="fa-icon" icon="trash"/>
                        </label>
                        <label className={`right`} onClick={this.handleActionBar.bind(null, 'signOut')}>
                            <FontAwesomeIcon className="fa-icon" icon="sign-out-alt"/>
                        </label>
                    </div>
                </div>

                {/*更名面板组件*/}
                <RenamePanel
                    pos={this.state.renamePanelPos}
                    name={this.state.renameValue}
                    show={this.state.renamePanelState}
                    cancelEvent={this.closeRenamePanel}
                    confirmEvent={this.confirmRenamePanel}
                />

                {/*分类ICON选择面板组件*/}
                <CategoryIconPanel
                    pos={this.state.categoryIconPanelPos}
                    show={this.state.categoryIconPanelState}
                    defaultIcon={this.state.selectedIcon}
                    cancelEvent={this.closeChangeCategoryIconPanel}
                    changeIconEvent={this.changeCategoryIconEvent}
                />

            </div>
        );
    }
}

export default CategoryContainer;
