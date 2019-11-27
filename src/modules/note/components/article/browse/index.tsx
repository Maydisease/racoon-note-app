import * as React         from "react";
import {connect}          from "react-redux";
import * as Mark          from 'mark.js';
import OverviewRuler      from '../../../../component/overview_ruler';
import './prism-okaidia.scss';
import './dark-mermaid.scss';
import {Service}          from '../../../../../lib/master.electron.lib';
import {VLightBoxService} from "../../../../component/light_box";
import {storeSubscribe}   from "../../../../../store/middleware/storeActionEvent.middleware";
import mermaid            from 'mermaid';

interface DefaultProps {
    onRef?: any,
    displayState?: boolean
}

class BrowseComponent extends React.Component {

    public intersectionObserver: IntersectionObserver;

    public props: DefaultProps = {
        onRef       : '',
        displayState: false
    };

    public state = {
        isSearchModel: false
    };

    public $element: React.RefObject<HTMLDivElement>;
    public $contentViewElement: React.RefObject<HTMLDivElement>;
    public selectedText: string;
    public browseContextMenu: any;
    public tempTimer: number;
    public umlRenderMaps: any;
    public currentArticleId: number;

    constructor(props: any) {
        super(props);
        this.props                = props;
        this.$element             = React.createRef();
        this.$contentViewElement  = React.createRef();
        this.mermaidObserve       = this.mermaidObserve.bind(this);
        this.intersectionObserver = new IntersectionObserver(this.mermaidObserve);
        this.unTagMark            = this.unTagMark.bind(this);
        this.setTagMark           = this.setTagMark.bind(this);
        this.browseContextMenu    = new Service.Menu();
        this.selectedText         = '';
        this.currentArticleId     = 0;
        this.umlRenderMaps        = {};
        this.browseContextMenuInit();
    }

    public shouldComponentUpdate(nextProps: Readonly<any>, nextState: Readonly<any>): boolean {

        const nextMarkdown     = nextProps.STORE_NOTE$ARTICLE_TEMP.markdown_content;
        const currentMarkDown  = (this.props as any).STORE_NOTE$ARTICLE_TEMP.markdown_content;
        const currentArticleId = (this.props as any).STORE_NOTE$ARTICLE.id;

        // 当前组件展示状态变更时，更新视图
        if ((this.props.displayState !== nextProps.displayState)) {
            return true;
        }

        // 当前articleId和markdown内容未做变更时，阻止更新视图
        if (this.currentArticleId === currentArticleId && nextMarkdown === currentMarkDown) {
            return false;
        }

        this.currentArticleId = currentArticleId;

        return true;
    }

    public browseContextMenuInit() {

        const $this: this = this;
        this.browseContextMenu.append(new Service.MenuItem({
            enabled    : true,
            accelerator: 'C',
            label      : 'Copy', click() {
                Service.Clipboard.writeText($this.selectedText);
            }
        }));

    }

    public componentDidMount() {

        this.setSearchTagInit();

        // 订阅快速搜索
        storeSubscribe('NOTE$QUICK_SEARCH', (action: any) => {
            const ARTICLE = (this.props as any).STORE_NOTE$ARTICLE;
            this.setTagMark(ARTICLE.quickSearchKey);
        });

        // 订阅搜索高亮标签销毁
        storeSubscribe('NOTE$UN_SEARCH_TAG', () => {
            this.unTagMark();
        });

        (this.$element.current as HTMLDivElement).oncontextmenu = () => {
            const selected: any = window.getSelection();
            if (selected.focusNode.data && selected.focusNode.data.length > 0) {
                this.selectedText = selected.focusNode.data;
                this.browseContextMenu.popup({window: Service.getWindow('master')});
            }
        }

    }

    public componentDidUpdate(prevProps: any, prevState: any) {
        const ARTICLE = (this.props as any).STORE_NOTE$ARTICLE;
        this.setTagMark(ARTICLE.quickSearchKey);
    }

    public setSearchTagInit() {
        const ARTICLE = (this.props as any).STORE_NOTE$ARTICLE;
        if (ARTICLE.quickSearchKey) {
            setTimeout(() => {
                this.setTagMark(ARTICLE.quickSearchKey);
            }, 100);
        } else {
            this.unTagMark();
        }
    }

    // mermaid 可视区观察器
    public mermaidObserve<IntersectionObserverCallback>(entries: IntersectionObserverEntry[]) {
        entries.forEach((entry: IntersectionObserverEntry) => {
            if (entry.isIntersecting) {
                const item           = entry.target;
                const displayElement = (item.querySelector('.display') as HTMLDivElement);
                const key: string    = item.getAttribute('_key') as string;
                if (this.umlRenderMaps && this.umlRenderMaps[key]) {
                    let renderState = false;

                    try {
                        displayElement.innerHTML = this.umlRenderMaps[key].content;
                        renderState              = true;
                    } catch (e) {
                        console.log('error', e);
                        renderState = false;
                    }

                    item.setAttribute('mermaid-render-state', `${renderState}`);
                }
            }
        });
    }

    // 渲染 mermaid
    public renderMermaid() {

        const $contentViewElement = this.$contentViewElement.current as HTMLDivElement;

        if (!$contentViewElement) {
            return;
        }

        const elementAll: NodeListOf<Element> = $contentViewElement.querySelectorAll(".mermaid");

        if (!elementAll) {
            return;
        }

        elementAll.forEach((item: HTMLElement, index: number) => {

            if (item.getAttribute('mermaid-render-state') === 'true') {
                return;
            }

            let isRenderFail     = true;
            const id             = 'mermaid_' + new Date().getTime().toString() + '_' + index;
            const sourceText     = (item.querySelector('.source') as HTMLDivElement).innerText;
            const displayElement = (item.querySelector('.display') as HTMLDivElement);
            const mermaidType    = item.getAttribute('mermaid-type') as string || '';

            item.setAttribute('_key', id);
            item.setAttribute('mermaid-render-state', 'false');

            if (mermaidType && sourceText.indexOf(mermaidType) as number >= 0) {
                try {
                    mermaid.render(id, sourceText, (response: any) => {
                        if (response) {
                            isRenderFail           = false;
                            this.umlRenderMaps[id] = {
                                element: item,
                                content: response
                            };
                        }
                    });
                } catch (e) {
                    console.warn(e);
                }
            }

            if (isRenderFail) {
                item.setAttribute('mermaid-render-state', 'error');
                displayElement.innerHTML = `` +
                    `<div class="tips">⚠️️ The <b>${mermaidType}</b> chart drawn is wrong.</div>` +
                    `<pre>` +
                    `<small>\`\`\`uml</small>\n${sourceText}\n<small>\`\`\`</small>` +
                    `</pre>`;
            }

            this.intersectionObserver.observe(item);

        });
    }

    // 重写超链接，由系统默认浏览器打开
    public rewriteATagLink() {
        setTimeout(() => {
            const browseElement: HTMLElement | null = document.querySelector('#app .wrap.browse-mod');
            if (browseElement) {
                const aTags: NodeListOf<Element> = browseElement.querySelectorAll('a');
                aTags.forEach((element: HTMLLinkElement) => {
                    const aLink     = element.href;
                    element.onclick = (event: MouseEvent) => {
                        Service.Dialog.showMessageBox({
                                title    : 'GoToLink',
                                type     : 'question',
                                message  : 'Open this link',
                                detail   : `Do you open '${aLink}' in your browser?`,
                                defaultId: 0,
                                cancelId : 1,
                                buttons  : ['Yes', 'Cancel']
                            }
                        ).then(async (result: any) => {
                            const btnIndex: number = result.response;
                            if (btnIndex === 0) {
                                Service.Shell.openExternal(aLink);
                            }
                        });
                        return false;
                    }
                });
            }
        }, 200);
    }

    // 循环绑定图片灯箱事件
    public bindImageLightBoxEvent() {
        setTimeout(() => {
            if (this.$element.current) {
                const BrowseImages: NodeListOf<HTMLImageElement> = (this.$element.current as HTMLElement).querySelectorAll('img');
                BrowseImages.forEach((element: HTMLImageElement) => {
                    element.onclick = () => {
                        new VLightBoxService({imageUrl: element.src}).init();
                    };
                });
            }
        }, 200);
    }

    // 移除搜索关键字高亮
    public unTagMark() {
        try {
            const instance = new Mark(this.$element.current as HTMLDivElement);
            instance.unmark({
                'element'         : 'span',
                'className'       : 'sch-highlight',
                'exclude'         : ['.hljs-line-numbers'],
                separateWordSearch: false
            });
        } catch (e) {
            console.log(e);
        }
    }

    // 设置标签高亮展示
    public setTagMark(searchKey: string) {
        const ARTICLE = (this.props as any).STORE_NOTE$ARTICLE;

        this.unTagMark();
        if (ARTICLE.quickSearchKey) {
            try {
                const instance = new Mark(this.$element.current as HTMLDivElement);
                instance.mark(searchKey, {
                    'element'         : 'span',
                    'className'       : 'sch-highlight',
                    'exclude'         : ['.hljs-line-numbers'],
                    separateWordSearch: false
                });
            } catch (e) {
                console.log(e);
            }
        }
    }

    public render() {

        clearTimeout(this.tempTimer);
        this.tempTimer = window.setTimeout(() => {
            this.renderMermaid();
        }, 10);

        this.rewriteATagLink();
        this.bindImageLightBoxEvent();
        const ARTICLE_TEMP = (this.props as any).STORE_NOTE$ARTICLE_TEMP;
        const ARTICLE      = (this.props as any).STORE_NOTE$ARTICLE;
        const FRAME        = (this.props as any).STORE_NOTE$FRAME;

        return (
            <div
                ref={this.$element}
                className="wrap browse-mod"
                style={{display: this.props.displayState ? 'none' : 'block'}}
            >
                {
                    this.$contentViewElement && this.$contentViewElement.current &&
					<OverviewRuler key={`${ARTICLE.id}_${FRAME.editMode}`} listenRef={this.$contentViewElement}/>
                }

                <div ref={this.$contentViewElement} className="content-view" dangerouslySetInnerHTML={{__html: ARTICLE_TEMP.html_content}}/>
            </div>
        );
    }
}

export default connect<{}, {}, DefaultProps>((state: any) => state)(BrowseComponent);
