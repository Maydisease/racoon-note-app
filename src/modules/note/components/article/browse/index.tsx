import * as React         from "react";
import {connect}          from "react-redux";
import * as Mark          from 'mark.js';
import './prism-okaidia.scss';
import './dark-mermaid.scss';
import {Service}          from '../../../../../lib/master.electron.lib';
import {VLightBoxService} from "../../../../component/light_box";
import {storeSubscribe}   from "../../../../../store/middleware/storeActionEvent.middleware";

const mermaid = require('mermaid');

mermaid.initialize({
    theme: 'dark'
});

interface DefaultProps {
    onRef?: any,
    displayState?: boolean
}

class BrowseComponent extends React.Component {

    public intersectionObserver: IntersectionObserver;

    public props: DefaultProps = {
        onRef: ''
    };

    public state = {
        isSearchModel: false
    };

    public $element: any;
    public selectedText: string;
    public browseContextMenu: any;

    constructor(props: any) {
        super(props);
        this.props                = props;
        this.$element             = React.createRef();
        this.intersectionObserver = new IntersectionObserver(this.mermaidObserve);
        this.unTagMark            = this.unTagMark.bind(this);
        this.setTagMark           = this.setTagMark.bind(this);
        this.browseContextMenu    = new Service.Menu();
        this.selectedText         = '';
        this.browseContextMenuInit();
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

        storeSubscribe('NOTE$QUICK_SEARCH', (action: any) => {
            const ARTICLE = (this.props as any).STORE_NOTE$ARTICLE;
            this.setTagMark(ARTICLE.quickSearchKey);
        });

        storeSubscribe('NOTE$UN_SEARCH_TAG', () => {
            this.unTagMark();
        });

        this.$element.current.oncontextmenu = () => {
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

    public mermaidObserve<IntersectionObserverCallback>(entries: IntersectionObserverEntry[]) {
        entries.forEach((entrie: IntersectionObserverEntry, index) => {
            if (entrie.isIntersecting && !entrie.target.getAttribute('mermaid-render-state')) {
                const element                 = entrie.target;
                const graphDefinition: string = (element.textContent as string);
                const elementId               = `graphContainer${element.getAttribute('key-index')}`;
                const mermaidRenderHtml       = mermaid.render(elementId, graphDefinition);
                element.innerHTML             = mermaidRenderHtml;
                element.setAttribute('mermaid-render-state', 'true');
            }
        });
    }

    public renderMermaid() {
        setTimeout(() => {
            const elementAll: NodeListOf<Element> = document.querySelectorAll(".mermaid");
            elementAll.forEach((item: HTMLElement, index: number) => {
                item.setAttribute('key-index', index + '');
                this.intersectionObserver.observe(item);
            });
        }, 200);
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
                            },
                            // btn 按钮被点击，删除被选中的Note
                            async (btnIndex: number) => {
                                if (btnIndex === 0) {
                                    Service.Shell.openExternal(aLink);
                                }
                            }
                        );
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
            const instance = new Mark(this.$element.current);
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
                const instance = new Mark(this.$element.current);
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
        this.renderMermaid();
        this.rewriteATagLink();
        this.bindImageLightBoxEvent();
        const ARTICLE_TEMP = (this.props as any).STORE_NOTE$ARTICLE_TEMP;
        return (<div ref={this.$element} className="wrap browse-mod" style={{display: this.props.displayState ? 'none' : 'block'}} dangerouslySetInnerHTML={{__html: ARTICLE_TEMP.html_content}}/>);
    }
}

export default connect<{}, {}, DefaultProps>((state: any) => state)(BrowseComponent);
