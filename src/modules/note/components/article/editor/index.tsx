import * as React           from 'react';
import * as CodeMirror      from "codemirror";
import {connect}            from 'react-redux';
import {store}              from "../../../../../store";
import * as MarkdownIt      from 'markdown-it';
import {EditorToolsService} from '../../../services/editorTools.service';

import {ArticleService} from "../../../services/article.service";
import './codemirror.scss';
import './monokai.scss';
import 'codemirror/mode/markdown/markdown';
import 'codemirror/addon/display/placeholder';

import 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-git';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-nginx';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sass';
import 'prismjs/components/prism-scss';
import 'prismjs/components/prism-textile';
import {Service}        from "../../../../../lib/master.electron.lib";
// import editorShortKeyMaps from '../../../../../config/editor/shortcutKey.conf';

const markdownItMermaid = require('markdown-it-mermaid').default;
const markdownItImsize  = require('markdown-it-imsize');

declare var Prism: any;

import Timeout = NodeJS.Timeout;

class EditorComponent extends React.Component {

    public state: any = {};
    public editor: any;
    public markdownIt: MarkdownIt;
    public editorTools: EditorToolsService;

    constructor(props: any) {
        super(props);
        this.saveContent   = this.saveContent.bind(this);
        this.insertContent = this.insertContent.bind(this);
        this.markdownIt    = new MarkdownIt({
            breaks   : true,
            highlight: (str: string, lang: string) => {

                let html: string;
                let htmlStr: string;
                let language: string;

                try {
                    language = lang;
                    htmlStr  = Prism.highlight(str, Prism.languages[language], language);
                } catch (e) {
                    language = 'textile';
                    htmlStr  = Prism.highlight(str, Prism.languages[language], language);
                }

                html = `<pre class="language-${language}" language="${language}"><code>${htmlStr}</code></pre>`;

                return html;
            }
        })
            .use(markdownItImsize)
            .use(markdownItMermaid);

    }

    // 保存内容
    public async saveContent(): Promise<boolean | void> {
        await new ArticleService().saveNote();
    }

    public componentDidMount() {
        this.editor = CodeMirror.fromTextArea((document.getElementById('textareaEditor') as any), {
            theme         : 'monokai',
            mode          : 'markdown',
            lineWrapping  : true,
            indentUnit    : 4,
            viewportMargin: 5000,
            lineNumbers   : true
        });

        let timer: Timeout;
        this.editor.on("update", (change: any) => {
            if (timer) {
                clearTimeout(timer)
            }
            timer = setTimeout(() => {

                const markdownContent = (this.editor.getValue() as string);

                store.dispatch({
                    type    : 'NOTE$UPDATE_ARTICLE_TEMP',
                    playload: {
                        title           : (this.props as any).STORE_NOTE$ARTICLE_TEMP.title,
                        markdown_content: markdownContent,
                        html_content    : (this.markdownIt.render(markdownContent) as string)
                    }
                });

                clearTimeout(timer);
            }, 200)
        });

        this.editor.setValue((this.props as any).STORE_NOTE$ARTICLE_TEMP.markdown_content);
        this.editorTools = new EditorToolsService(this.editor);

        Service.RenderToRender.subject('attached@editorInsertImage', async (event: any, params: any): Promise<boolean | void> => {
            this.insertContent('image', params.data);
        });

    }

    public insertContent(type: string, obj: any) {
        switch (type) {
            case 'image':
                this.editorTools.insertImage(obj.imageTitle, obj.imageUrl);
                break;
        }
    }

    public render() {

        return (
            <div className="wrap edit-mod">
                <div className="editor-container">
                    <textarea id="textareaEditor" placeholder="write your dreams..."/>
                </div>
            </div>
        )
    }
}

export default connect((state: any) => state)(EditorComponent);