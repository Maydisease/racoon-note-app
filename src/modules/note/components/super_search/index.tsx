import * as React from "react";
import './search.scss';
import {request}  from "../../services/requst.service";
import {Service}  from "../../../../lib/master.electron.lib";

class SuperSearch extends React.Component {

    public state: any = {
        searchTime        : 0 + 'ms',
        inputFocusState   : false,
        clearInputBtnState: false,

        from: {
            searchKeys: {
                value: ''
            }
        },

        filterType: 0, // 0 title 1 content
        searchData: [],
    };

    public keysInput: any;
    public timer: any;
    public doubleCount: number;
    public selectedObj: any;
    public categoryList: any[] = [];

    constructor(props: any) {
        super(props);
        this.timer                  = null;
        this.keysInput              = React.createRef();
        this.handleInputActive      = this.handleInputActive.bind(this);
        this.handleChange           = this.handleChange.bind(this);
        this.clearSearchKeys        = this.clearSearchKeys.bind(this);
        this.switchFilterType       = this.switchFilterType.bind(this);
        this.handleSearchListSelect = this.handleSearchListSelect.bind(this);
        this.doubleCount            = 1;
    }

    public async componentDidMount() {

        const getCategoryResponse = await request('note', 'getCategoryData');
        if (getCategoryResponse.result === 0) {
            this.categoryList = getCategoryResponse.data;
        }

        document.onkeydown = (ev: any): any => {
            const e = ev || event;
            // 38 up keyboard || 40 down keyboard
            if (e.keyCode === 38 || e.keyCode === 40) {
                this.keysInput.current.blur();
                switch (e.keyCode) {
                    case 38:
                        this.prevSelected();
                        break;
                    case 40:
                        this.nextSelected();
                        break;
                }
                return false;
            }
        };
        this.keysInput.current.focus();

    };

    public nextSelected() {
        if (this.state.searchData && this.state.searchData.length > 0) {
            const currentIndex = this.state.searchData.findIndex((sourceItem: any) => sourceItem.selected);
            const state        = this.state;
            const nextIndex    = currentIndex === (state.searchData.length - 1) ? 0 : currentIndex + 1;
            this.resetSearchListSelected();
            state.searchData[nextIndex].selected = true;
            this.setState(state);
        }
    }

    public prevSelected() {
        if (this.state.searchData && this.state.searchData.length > 0) {
            const currentIndex = this.state.searchData.findIndex((sourceItem: any) => sourceItem.selected);
            const state        = this.state;
            const prevIndex    = currentIndex === 0 ? (state.searchData.length - 1) : currentIndex - 1;
            this.resetSearchListSelected();
            state.searchData[prevIndex].selected = true;
            this.setState(state);
        }
    }

    // 清空搜索关键词
    public clearSearchKeys() {
        const state                 = this.state;
        state.from.searchKeys.value = '';
        state.clearInputBtnState    = false;
        state.inputFocusState       = false;
        state.searchData            = [];
        this.setState(state);
        Service.RenderToRender.emit('master@superSearchClearKeys', {emitAuthor: 'search'});

    }

    // 搜索框状态
    public handleInputActive(sourceState: any): void {
        const state           = this.state;
        state.inputFocusState = !(!sourceState && this.state.from.searchKeys.value.length === 0);
        this.setState(state);
    }

    public buildCategoryCrumbs(data: any[], cid: number) {
        const crumbs: any[] = [];
        const findLoop      = (cid1: number) => {
            data.filter((item: any) => {
                if (item.id === cid1) {
                    crumbs.unshift(item.name);
                    findLoop(item.parent);
                }
            });
        };
        findLoop(cid);
        return crumbs;
    };


    public async getSearchData(): Promise<boolean | void> {

        const state = this.state;

        if (!this.state.from.searchKeys.value || this.state.from.searchKeys.value === '') {
            state.searchData  = [];
            state.selectedObj = undefined;
            this.setState(state);
            return false;
        }

        const type = this.state.filterType;
        const keys = this.state.from.searchKeys.value;
        if (keys) {
            clearTimeout(this.timer);
            this.timer = setTimeout(async () => {
                const searchStartTime = new Date().getTime();

                const response = await Service.ClientCache('/note/article').searchArticle({type, keys});

                if (response.result !== 1) {

                    const categoryList: any = [];
                    this.categoryList.forEach((item: any) => {
                        const {id, name, parent} = item;
                        categoryList.push({id, name, parent})
                    });

                    response.forEach((item: any, index: number) => {
                        response[index].crumbs   = this.buildCategoryCrumbs(categoryList, item.cid);
                        response[index].selected = index === 0;
                    });
                    state.searchData = response;

                } else {
                    state.searchData = [];
                }
                const searchEndTime = new Date().getTime() - searchStartTime + 'ms';
                state.searchTime    = searchEndTime;
                state.selectedObj   = undefined;
                this.setState(state);
            }, 200);
        }
    }

    // 表单修改时的数据同步
    public async handleChange(event: React.ChangeEvent<HTMLInputElement>) {
        const state                         = this.state;
        state.clearInputBtnState            = event.target.value.length > 0;
        state.from[event.target.name].value = event.target.value;
        this.setState(state);
        this.getSearchData();
    }

    public switchFilterType() {
        const state      = this.state;
        state.filterType = this.state.filterType === 0 ? 1 : 0;
        state.searchData = [];
        this.setState(state);
        this.getSearchData();

        Service.RenderToRender.emit('master@superSearchChangeFilterType', {emitAuthor: 'search', data: {searchKey: this.state.from.searchKeys.value, searchType: this.state.filterType}});
    }

    public resetSearchListSelected() {
        const state = this.state;
        state.searchData.some((item: any, index: number): any => {
            if (item.selected) {
                state.searchData[index].selected = false;
            }
        });
    }

    public handleSearchListSelect(item: any) {
        this.resetSearchListSelected();
        const state                      = this.state;
        const index                      = state.searchData.findIndex((sourceItem: any) => item.id === sourceItem.id);
        state.searchData[index].selected = true;
        this.setState(state);
        const searchKey  = this.state.from.searchKeys.value;
        const searchType = this.state.filterType;
        Service.RenderToRender.emit('master@superSearchSelectedList', {emitAuthor: 'search', data: {...item, searchKey, searchType}});
    }

    public render() {

        const SearchList = (props: any) => {

            const getPath = (crumbs: any) => {
                let crumbsStr = '';
                crumbs.map((name: string) => {
                    crumbsStr += `/${name}`;
                });
                return crumbsStr;
            };

            const addKeyTag = (sourceStr: string) => {

                let Rex: string | RegExp = '';

                try {
                    Rex = new RegExp(this.state.from.searchKeys.value, 'g');
                } catch (e) {
                    Rex = this.state.from.searchKeys.value;
                }

                return sourceStr.replace(Rex, "<em class='tag'>" + this.state.from.searchKeys.value + "</em>");
            };
            if (this.state.searchData && this.state.searchData.length > 0) {
                return (
                    this.state.searchData.map((item: any, index: number) => {
                        return (
                            <li key={item.id} className={`${item.selected && 'current'}`} onClick={this.handleSearchListSelect.bind(this, item)}>
                                {
                                    this.state.filterType === 0 ?
                                        <span className="find-keys" dangerouslySetInnerHTML={{__html: `${addKeyTag(item.title)}.md`}}/> :
                                        <span className="find-keys" dangerouslySetInnerHTML={{__html: `${addKeyTag(item.keysDescription)}`}}/>
                                }
                                {
                                    this.state.filterType === 0 ?
                                        <span className="find-path">{`${getPath(item.crumbs)}/`}</span> :
                                        <span className="find-path">{`${getPath(item.crumbs)}/${item.title}.md`}</span>
                                }
                            </li>
                        )
                    })
                )
            } else {
                return (null);
            }

        };

        return (
            <div id="nodeSuperSearch">
                <div className="search-bar">
                    <div className={`wrap ${this.state.inputFocusState && 'focus'}`}>
                        <div className={`formBox ${this.state.inputFocusState && 'focus'}`}>
                            <i className="icon iconfont icon-1 icon-search"/>
                            <input
                                name="searchKeys"
                                type="text"
                                value={this.state.from.searchKeys.value}
                                onFocus={this.handleInputActive.bind(this, true)}
                                onBlur={this.handleInputActive.bind(this, false)}
                                placeholder="Search Notes"
                                ref={this.keysInput}
                                onChange={this.handleChange}
                            />
                            {this.state.clearInputBtnState && <i className="icon iconfont icon-2 icon-wrong" onClick={this.clearSearchKeys}/>}
                        </div>
                    </div>
                </div>
                <div className="search-filter">
                    <span className={`find-type ${this.state.filterType === 0 ? 'type_1' : 'type_2'}`} onClick={this.switchFilterType}>
                        <em className={`slider ${this.state.filterType === 0 ? 'type_1' : 'type_2'}`}/>
                    </span>
                    {/* <span className="text">find path</span>
                     <span className="find-path">/work/os/etois/tandongs.md</span> */}
                </div>
                <div className="search-content">
                    <ul>
                        <SearchList/>
                    </ul>
                </div>
                <div className="find-state-bar">
                    {
                        this.state.searchData &&
						<span>
                            count: <em>{this.state.searchData.length}</em>
                            time: <em>{this.state.searchTime}</em>
                        </span>
                    }
                </div>
            </div>
        );
    }
}

export default SuperSearch;
