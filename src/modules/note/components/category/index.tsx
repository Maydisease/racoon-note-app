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
        categoryIconPanelState: false,
        renameValue           : '',
        categoryIconPanelPos  : {},
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
        const request    = await new Service.ServerProxy('note', 'getCategoryData').send();
        if (request.request !== 1 && request.data && request.data.length > 0) {
            state.categorySource = request.data;
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

    public async componentDidMount() {
        const state: any = this.state;
        state.isDidMount = true;
        this.setState(state);
        await this.updateCategoryDom();
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
        this.setState(state);

        // 如果当前ICON面板选择的ICON与之前的ICON不一致的话
        if (this.state.selectedIcon !== this.state.defaultIcon) {
            const updateIconBody = {
                id      : this.state.categoryObj.id,
                iconText: this.state.selectedIcon
            };

            const response = await new Service.ServerProxy('note', 'updateCategoryIcon', updateIconBody).send();
            let msg        = '';
            let type: 'success' | 'error';
            if (response.result !== 1) {
                msg  = 'Change Category Icon success';
                type = 'success'
            } else {
                msg  = 'Change Category Icon fail';
                type = 'error'
            }
            new VMessageService(msg, type, 2000).init();
        }

    }

    // 更换category名确认面板事件
    public async confirmRenamePanel(newName: string): Promise<boolean | void> {
        if (newName !== '' && this.state.categoryObj.name !== newName) {

            const renameBody = {
                id    : this.state.categoryObj.id,
                parent: this.state.categoryObj.parent,
                newName
            };

            const request = await new Service.ServerProxy('note', 'renameCategory', renameBody).send();

            // 当前父级分类下只允许一个同名子分类
            if (request.messageCode === 1010) {
                const msg = 'There is a brother of the same name';
                new VMessageService(msg, 'error', 5000).init();
                this.closeRenamePanel();
                return false;
            }

            // 分类更名成功
            if (request.result !== 1) {
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

                const menuId = Number(itemElement.getAttribute('data-menu-id'));

                if (menuId !== 0 && (!this.state.categoryObj) || (this.state.categoryObj && this.state.categoryObj.id !== menuId)) {
                    EventEmitter.emit('selectedCategory', menuId);
                }

                const state: any      = this.state;
                state.categoryObj     = this.state.categorySource.filter((item: any) => item.id === Number(menuId))[0];
                state.categoryElement = itemElement;
                state.defaultIcon     = (itemElement.querySelector('img') as HTMLElement).title;
                this.setState(state);

                // 分类更名组件
                if (this.state.renamePanelState) {
                    this.closeRenamePanel();
                } else {
                    this.setRenamePanelPos();
                }

                // 分类图标组件
                if (this.state.categoryIconPanelState) {
                    console.log('closeChangeCategoryIconPanel');
                    this.closeChangeCategoryIconPanel();
                } else {
                    console.log('setIconPanelPos');
                    this.setIconPanelPos();
                }

                event.stopPropagation();
            };

            if (categoryList) {
                categoryList.querySelectorAll('.item').forEach((itemElement: HTMLElement) => {

                    // 绑定鼠标左键
                    itemElement.onclick       = (event: MouseEvent) => {
                        categoryMenusEventBind(event, itemElement);
                    };
                    // 绑定鼠标右键
                    itemElement.oncontextmenu = (event: MouseEvent) => {
                        const isCurrent = (itemElement.querySelector('label') as HTMLElement).getAttribute('current') === 'true';
                        if (isCurrent) {
                            // const isLast = itemElement.getAttribute('data-is-last');
                            const items = this.contextMenu.items;

                            // item[0] Add article;
                            // item[1] Created category;
                            // item[2] Separator;
                            // item[3] Rename category;
                            // item[4] Remove category;
                            // item[5] Change icon;

                            if (!this.state.categoryObj) {
                                items[0].enabled = false;
                                items[2].enabled = false;
                                items[4].enabled = false;
                                items[5].enabled = false;
                            } else {
                                items[0].enabled = true;
                                items[2].enabled = true;
                                items[4].enabled = true;
                                items[5].enabled = true;
                            }

                            // if (isLast === 'true') {
                            //     items[0].enabled = isLast === 'true';
                            // } else {
                            //     items[0].enabled = false;
                            // }
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
        this.contextMenu.append(new Service.MenuItem({type: 'separator'}));
        // item[4];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'D',
            label      : 'Remove category', click() {
                $this.removeCategory()
            }
        }));
        // item[5];
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'I',
            label      : 'Change icon', click() {
                $this.changeCategoryIcon();
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
        let postfix          = new Date().getTime() + '';
        postfix              = postfix.substring(postfix.length - 4, postfix.length);
        const name: string   = 'temp' + postfix;
        const parent: number = this.state.categoryObj ? this.state.categoryObj.id : 0;
        const request        = await new Service.ServerProxy('note', 'addCategoryData', {parent, name}).send();
        if (request.result !== 1) {
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
                // btn 按钮被点击，提交删除分类操作
                async (btnIndex: number): Promise<void | boolean> => {
                    if (btnIndex === 0) {
                        const id      = this.state.categoryObj.id;
                        const request = await new Service.ServerProxy('note', 'removeCategory', {id}).send();

                        // 当前父级分类下只允许一个同名子分类
                        if (request.messageCode === 1013) {
                            const msg = 'Current category has subcategories!';
                            new VMessageService(msg, 'error', 3000).init();
                            this.closeRenamePanel();
                            return false;
                        }

                        // 当前分类下有文章
                        if (request.messageCode === 1014) {
                            const msg = 'Current category has articles!';
                            new VMessageService(msg, 'error', 3000).init();
                            this.closeRenamePanel();
                            return false;
                        }

                        if (request.result !== 1) {
                            await this.updateCategoryDom();
                        }
                    }

                }
            );

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
    public setRenamePanelPos() {
        const categoryElement  = (this.state.categoryElement as HTMLElement);
        const state            = this.state;
        state.renamePanelPos.y = Number(categoryElement.getBoundingClientRect().top);
        this.setState(state);
    }

    // 设置ICON面板的位置
    public setIconPanelPos() {
        const categoryElement        = (this.state.categoryElement as HTMLElement);
        const {top}                  = categoryElement.getBoundingClientRect();
        const state                  = this.state;
        state.categoryIconPanelPos.y = Number(top);
        state.categoryIconPanelPos.x = (categoryElement.querySelector('.icon-2') as HTMLElement).offsetLeft;
        this.setState(state);
    }

    // 打开附件window
    public openAttached() {
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
        const state                        = this.state;
        const key                          = this.state.categorySource.findIndex((sourceItem: any) => sourceItem.id === this.state.categoryObj.id);
        state.categorySource[key].iconText = item.icon;
        state.selectedIcon                 = item.icon;
        this.setState(state);
        this.categoryMenusEventBind();
    }

    public render() {

        return (
            <div className={`categoryContainer ${this.state.componentShowState ? 'show' : ''}`}>
                <div className="wrap">
                    <div className="category-list">
                        <div className="item default" data-menu-id="0">
                            <label>
                                <span className={`icon icon-2`}>
                                    <FontAwesomeIcon className="fa-icon" icon="desktop"/>
                                </span>
                                <span className="text">default</span>
                            </label>
                        </div>
                        {
                            this.state.categorySource &&
                            this.state.categorySource.length > 0 &&
                            // 分类树组件
							<CategoryTree
								selectedIcon={this.state.selectedIcon}
								data={this.state.categorySource}
							/>
                        }
                    </div>

                    {/*控制栏*/}
                    <div className="action-bar">
                        <label onClick={this.handleActionBar.bind(null, 'setting')}>
                            <FontAwesomeIcon className="fa-icon left" icon="sliders-h"/>
                        </label>
                        <span className="line left"/>
                        <label onClick={this.handleActionBar.bind(null, 'search')}>
                            <FontAwesomeIcon className="fa-icon left" icon="search"/>
                        </label>
                        <span className="line left"/>
                        <label onClick={this.handleActionBar.bind(null, 'attached')}>
                            <FontAwesomeIcon className="fa-icon left" icon="paperclip"/>
                        </label>
                        <span className="line left"/>
                        <label onClick={this.handleActionBar.bind(null, 'trash')}>
                            <FontAwesomeIcon className="fa-icon left" icon="trash"/>
                        </label>
                        <label onClick={this.handleActionBar.bind(null, 'signOut')}>
                            <FontAwesomeIcon className="fa-icon right" icon="sign-out-alt"/>
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
                    defaultIcon={this.state.defaultIcon}
                    cancelEvent={this.closeChangeCategoryIconPanel}
                    changeIconEvent={this.changeCategoryIconEvent}
                />

            </div>
        );
    }
}

export default CategoryContainer;
