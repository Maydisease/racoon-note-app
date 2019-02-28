import * as React      from 'react';
import * as CodeMirror from "codemirror";
import {connect}       from 'react-redux';
import {store}         from "../../../../../store";
import * as MarkdownIt from 'markdown-it';

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
// import editorShortKeyMaps from '../../../../../config/editor/shortcutKey.conf';

const markdownItMermaid = require('markdown-it-mermaid').default;

declare var Prism: any;

import Timeout = NodeJS.Timeout;

class EditorComponent extends React.Component {

    public state: any = {};
    public editor: any;
    public markdownIt: MarkdownIt;

    constructor(props: any) {
        super(props);
        this.saveContent = this.saveContent.bind(this);
        this.markdownIt  = new MarkdownIt({
            breaks   : false,
            highlight: (str: any, lang: any) => {
                let html;

                try {
                    html = '<pre class="language-' + lang + '"><code>' + Prism.highlight(str, Prism.languages[lang], lang) + '</code></pre>';
                } catch (e) {
                    html = '<pre class="language-textile"><code>' + Prism.highlight(str, Prism.languages['textile'], ('textile' as any)) + '</code></pre>';
                }

                return html
            }
        }).use(markdownItMermaid);


        console.log(this.markdownIt.render(`\`\`\`mermaid
                    graph TD
                        A[Christmas] -->|Get money| B(Go shopping)
                        B --> C{Let me think}
                        C -->|One| D[Laptop]
                        C -->|Two| E[iPhone]
                        C -->|Three| F[Car]
                    \`\`\``))

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

        // TODO 保留至编辑器内的markdown操作
        // const extraEvents = {};
        // const keyMap      = editorShortKeyMaps;
        //
        // extraEvents[keyMap.save] = async () => {
        //     await this.saveContent();
        // };
        //
        // this.editor.setOption("extraKeys", extraEvents);
        this.editor.setValue((this.props as any).STORE_NOTE$ARTICLE_TEMP.markdown_content);

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