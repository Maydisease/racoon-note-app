import * as React          from 'react';
import RenamePanel         from './rename';
import CategoryTree        from './categoryTree';
import {ArticleService}    from "../../services/article.service";
import {EventEmitter}      from "../../services/events.service";
import {Service}           from "../../../../lib/master.electron.lib";
import {storeSubscribe}    from "../../../../store/middleware/storeActionEvent.middleware";
import {VMessageService}   from "../../../component/message";
import {FontAwesomeIcon}   from '@fortawesome/react-fontawesome';
import {store}             from "../../../../store";
import {AppCommandService} from "../../services/appCommand.service";
import {AttachedService}   from '../../services/attached.server';

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

interface IState {
    contextMenu: string,
    categoryObj: CategoryItem | any,
    categoryTree: any;
    categorySource: any;
    categoryElement: HTMLElement | null;
    isDidMount: boolean;
    renamePanelPos: RenamePanelPos,
    renamePanelState: boolean,
    renameValue: string,
    componentShowState: boolean
}

class CategoryContainer extends React.Component {

    public contextMenu: any;

    public state: IState = {
        componentShowState: true,
        contextMenu       : '',
        categoryObj       : {},
        categoryTree      : [],
        categorySource    : [],
        categoryElement   : null,
        isDidMount        : false,
        renamePanelPos    : {},
        renamePanelState  : false,
        renameValue       : ''
    };

    public categoryMenusElement: HTMLElement | any;

    public articleService: ArticleService;
    public appCommandService: AppCommandService;
    public attachedService: AttachedService;

    constructor(readonly props: any) {
        super(props);
        this.contextMenu = new Service.Menu();
        this.contextMenuInit();
        this.categoryMenusElement = undefined;
        this.articleService       = new ArticleService();
        this.attachedService      = new AttachedService();
        this.appCommandService    = new AppCommandService();
        this.closeRenamePanel     = this.closeRenamePanel.bind(this);
        this.confirmRenamePanel   = this.confirmRenamePanel.bind(this);
        this.handleActionBar      = this.handleActionBar.bind(this);
    }

    public async componentWillMount() {
        console.log('componentWillMount');
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
            if (request.messageCode === 1103) {
                const msg = 'There is a brother of the same name';
                new VMessageService(msg, 'error', 5000).init();
                this.closeRenamePanel();
                return false;
            }

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

            // const hasClass = (element: any, cls: any) => {
            //     return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
            // };

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
                this.setState(state);

                if (this.state.renamePanelState) {
                    this.closeRenamePanel()
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
                            const isLast = itemElement.getAttribute('data-is-last');
                            const items  = this.contextMenu.items;
                            if (!this.state.categoryObj) {
                                items[0].enabled = false;
                                items[2].enabled = false;
                                items[4].enabled = false;
                            } else {
                                items[0].enabled = true;
                                items[2].enabled = true;
                                items[4].enabled = true;
                            }

                            if (isLast === 'true') {
                                items[0].enabled = isLast === 'true';
                            } else {
                                items[0].enabled = false;
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
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'A',
            label      : 'Add note', click() {
                $this.createdNote()
            }
        }));
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'N',
            label      : 'New category', click() {
                $this.createdCategory()
            }
        }));
        this.contextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'R',
            label      : 'Rename category', click() {
                $this.renameCategory()
            }
        }));
        this.contextMenu.append(new Service.MenuItem({type: 'separator'}));
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
        EventEmitter.emit('createdNote', this.state.categoryObj.id);
        console.log(resState);
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
                        if (request.messageCode === 1106) {
                            const msg = 'Current category has subcategories!';
                            new VMessageService(msg, 'error', 3000).init();
                            this.closeRenamePanel();
                            return false;
                        }

                        // 当前父级分类下只允许一个同名子分类
                        if (request.messageCode === 1107) {
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
            state.renamePanelPos.y = (this.state.categoryElement as HTMLElement).offsetTop;
            state.renamePanelState = true;
            state.renameValue      = this.state.categoryObj.name;
        }
        this.setState(state);
    }

    public openAttached() {
        console.log('openAttached');
        this.attachedService.open();
    }

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
                        {this.state.categorySource && this.state.categorySource.length > 0 && <CategoryTree data={this.state.categorySource}/>}
                    </div>
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
                <RenamePanel
                    pos={this.state.renamePanelPos}
                    name={this.state.renameValue}
                    show={this.state.renamePanelState}
                    cancelEvent={this.closeRenamePanel}
                    confirmEvent={this.confirmRenamePanel}
                />
            </div>
        );
    }
}

export default CategoryContainer;
