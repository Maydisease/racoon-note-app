import * as React         from "react";
import {connect}          from "react-redux";
import './prism-okaidia.scss';
import './dark-mermaid.scss';
import {VLightBoxService} from "../../../../component/light_box";

const mermaid = require('mermaid');

mermaid.initialize({
    theme: 'dark'
});

(window as any).editorCache = {};

class BrowseComponent extends React.Component {

    public intersectionObserver: IntersectionObserver;

    public $element: any;

    constructor(props: any) {
        super(props);
        this.$element             = React.createRef();
        this.intersectionObserver = new IntersectionObserver(this.mermaidObserve);
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

    public rewriteATagLink(){
        setTimeout(() => {
            const browseElement: HTMLElement | null = document.querySelector('#app .wrap.browse-mod');
            if(browseElement){
                const aTags: NodeListOf<Element> = browseElement.querySelectorAll('a');
                aTags.forEach((element: HTMLElement) => {
                    element.onclick = (e) => {
                        return false;
                    }
                });
            }
        }, 200);
    }

    public bindImageLightBoxEvent() {
        setTimeout(() => {
            const BrowseImages: NodeListOf<HTMLImageElement> = (this.$element.current as HTMLElement).querySelectorAll('img');
            BrowseImages.forEach((element: HTMLImageElement) => {
                element.onclick = () => {
                    new VLightBoxService({imageUrl: element.src}).init();
                };
            });
        }, 200);
    }

    public render() {
        this.renderMermaid();
        this.rewriteATagLink();
        this.bindImageLightBoxEvent();
        const ARTICLE_TEMP = (this.props as any).STORE_NOTE$ARTICLE_TEMP;
        return (<div ref={this.$element} className="wrap browse-mod" dangerouslySetInnerHTML={{__html: ARTICLE_TEMP.html_content}}/>);
    }
}

export default connect((state: any) => state)(BrowseComponent);