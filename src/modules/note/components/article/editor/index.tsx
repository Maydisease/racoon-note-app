import * as React                          from 'react';
import {connect}                           from 'react-redux';
import {store}                             from "../../../../../store";
import * as MarkdownIt                     from 'markdown-it';
import EditorMonaco                        from '../../../../component/editors/monaco';
import {EditorToolsService}                from '../../../services/editorTools.service';
import markdownItMermaid                   from "../../../../../lib/plugins/markdown_it/mermaid";
import markdownItToDoList                  from "../../../../../lib/plugins/markdown_it/toDoList";
import {ArticleService}                    from "../../../services/article.service";
import {$AttachedService, AttachedService} from '../../../services/window_manage/attached.server';
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
import 'prismjs/components/prism-dart';
import 'prismjs/components/prism-yaml';

const markdownItImsize = require('markdown-it-imsize');

declare var Prism: any;


interface DefaultProps {
    displayState: boolean
}


interface TextAreaHistory {
    list: string[]
    index: number
}

class EditorComponent extends React.Component {

    public state: any = {
        content       : '',
        isNativeEditor: false,
        editorInput   : {
            content: ''
        },
        superLinkPanel: {
            status: false,
            title : ''
        },
    };

    public editor: any;
    public markdownIt: MarkdownIt;
    public editorTools: EditorToolsService;
    public attachedService: AttachedService;

    public props: DefaultProps;
    public handelEditorTimer: number;
    public textAreaHistory: TextAreaHistory;
    public textareaElement: React.RefObject<HTMLTextAreaElement>;

    constructor(props: any) {
        super(props);
        this.saveContent         = this.saveContent.bind(this);
        this.handelEditor        = this.handelEditor.bind(this);
        this.writeArticleToStore = this.writeArticleToStore.bind(this);
        this.attachedService     = $AttachedService;

        this.textAreaHistory = {
            list : [],
            index: 0
        };

        this.textareaElement = React.createRef();
        this.markdownIt      = new MarkdownIt({
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

                try {
                    html = `<pre class="language-${language}" language="${language}"><code>${htmlStr}</code></pre>`;
                } catch (e) {
                    html = '';
                }

                return html;
            }
        })
            .use(markdownItImsize)
            .use(markdownItToDoList)
            .use(markdownItMermaid);

    }

    // 保存内容
    public async saveContent(): Promise<boolean | void> {
        await new ArticleService().saveNote();
    }

    public componentDidUpdate(newProps: any, newState: any) {
        if (newProps.STORE_NOTE$ARTICLE.id !== (this.props as any).STORE_NOTE$ARTICLE.id) {
            store.dispatch({
                type: 'CLEAR'
            });
        }
        if (!newProps.displayState && this.props.displayState) {
            const state   = this.state;
            state.content = (this.props as any).STORE_NOTE$ARTICLE_TEMP.markdown_content;
            this.setState(state);

            let textAreaCursor = 0;
            if (this.state.isNativeEditor) {
                const textAreaSelection = this.editorTools.getTextAreaSelection();
                if (textAreaSelection.start === textAreaSelection.end) {
                    textAreaCursor = textAreaSelection.start;
                } else {
                    textAreaCursor = textAreaSelection.end;
                }

            }

            store.dispatch({
                type    : 'EDITOR$ADD',
                playload: {
                    content: (this.props as any).STORE_NOTE$ARTICLE_TEMP.markdown_content,
                    cursor : textAreaCursor
                }
            });

        }
    }

    public componentDidMount() {
        this.editorTools = new EditorToolsService(this.textareaElement.current as HTMLTextAreaElement);

    }

    // 表单修改时的数据同步
    public handelEditor(event: React.ChangeEvent<HTMLTextAreaElement>) {

        const contentValue = event.target.value;
        const state        = this.state;
        state.content      = contentValue;
        this.setState(state);
        this.writeArticleToStore(contentValue);
    }

    // 写入内容到store
    public writeArticleToStore(content: string) {
        if (this.handelEditorTimer) {
            clearTimeout(this.handelEditorTimer);
        }
        this.handelEditorTimer = window.setTimeout(async () => {
            store.dispatch({
                type    : 'NOTE$UPDATE_ARTICLE_TEMP',
                playload: {
                    title           : (this.props as any).STORE_NOTE$ARTICLE_TEMP.title,
                    markdown_content: content,
                    html_content    : (this.markdownIt.render(content) as string)
                }
            });

            let textAreaCursor = 0;
            if (this.state.isNativeEditor) {
                const textAreaSelection = this.editorTools.getTextAreaSelection();
                if (textAreaSelection.start === textAreaSelection.end) {
                    textAreaCursor = textAreaSelection.start;
                } else {
                    textAreaCursor = textAreaSelection.end;
                }

            }

            store.dispatch({
                type    : 'EDITOR$ADD',
                playload: {
                    content,
                    cursor: textAreaCursor
                }
            });

            clearTimeout(this.handelEditorTimer);
        }, 200);
    }

    public render() {

        return (
            <div className="wrap edit-mod" style={{display: this.props.displayState ? 'block' : 'none'}}>
                <div className="editor-container">
                    <EditorMonaco input={this.state.editorInput.content}/>
                </div>
            </div>
        )
    }
}

export default connect<{}, {}, DefaultProps>((state: any) => state)(EditorComponent);
