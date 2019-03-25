import * as React                          from 'react';
import {connect}                           from 'react-redux';
import {store}                             from "../../../../../store";
import * as MarkdownIt                     from 'markdown-it';
import {EditorToolsService}                from '../../../services/editorTools.service';
import {Service}                           from "../../../../../lib/master.electron.lib";
import {ArticleService}                    from "../../../services/article.service";
import {FontAwesomeIcon}                   from "@fortawesome/react-fontawesome";
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
import {VMessageService} from "../../../../component/message";
import {storeSubscribe}  from "../../../../../store/middleware/storeActionEvent.middleware";
// import {ActionCreators}  from 'redux-undo';
const reduxUndo = require('redux-undo');

const markdownItMermaid = require('markdown-it-mermaid').default;
const markdownItImsize  = require('markdown-it-imsize');

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
        content: ''
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
        this.insertContent       = this.insertContent.bind(this);
        this.handelEditorTools   = this.handelEditorTools.bind(this);
        this.handelEditor        = this.handelEditor.bind(this);
        this.writeArticleToStore = this.writeArticleToStore.bind(this);
        this.attachedService     = $AttachedService;

        this.textAreaHistory = {
            list : [],
            index: 0
        };

        this.textareaElement     = React.createRef();
        this.markdownIt          = new MarkdownIt({
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

    public componentDidUpdate(newProps: any, newState: any) {
        if (newProps.STORE_NOTE$ARTICLE.id !== (this.props as any).STORE_NOTE$ARTICLE.id) {
            store.dispatch({type: 'EDITOR$CLEAR'});
            console.log(store.getState(), '----');
        }
        if (!newProps.displayState && this.props.displayState) {
            const state   = this.state;
            state.content = (this.props as any).STORE_NOTE$ARTICLE_TEMP.markdown_content;
            this.setState(state);
        }
    }

    public componentDidMount() {

        this.editorTools = new EditorToolsService(this.textareaElement.current as HTMLTextAreaElement);

        Service.RenderToRender.subject('attached@editorInsertImage', async (event: any, params: any): Promise<boolean | void> => {
            this.insertContent('image', params.data);
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_Z', () => {
            this.contentUndoOrRedo('undo');
        });

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_SHIFT_Z', () => {
            this.contentUndoOrRedo('redo');
        });

    }

    public contentUndoOrRedo(type: string): void {

        switch (type) {
            case 'undo':
                if ((store.getState().EDITOR$HISTORY as any).past.length > 0) {
                    store.dispatch(reduxUndo.ActionCreators['undo']());
                    store.dispatch({
                        type    : 'NOTE$UPDATE_ARTICLE_TEMP',
                        playload: {
                            title           : (this.props as any).STORE_NOTE$ARTICLE_TEMP.title,
                            markdown_content: (store.getState().EDITOR$HISTORY as any).present.content,
                            html_content    : (this.markdownIt.render((store.getState().EDITOR$HISTORY as any).present.content) as string)
                        }
                    });
                    const state   = this.state;
                    state.content = (store.getState().EDITOR$HISTORY as any).present.content;
                    this.setState(state);
                }
                break;
            case 'redo':
                if ((store.getState().EDITOR$HISTORY as any).future.length > 0) {
                    store.dispatch(reduxUndo.ActionCreators['redo']());
                    store.dispatch({
                        type    : 'NOTE$UPDATE_ARTICLE_TEMP',
                        playload: {
                            title           : (this.props as any).STORE_NOTE$ARTICLE_TEMP.title,
                            markdown_content: (store.getState().EDITOR$HISTORY as any).present.content,
                            html_content    : (this.markdownIt.render((store.getState().EDITOR$HISTORY as any).present.content) as string)
                        }
                    });
                    const state   = this.state;
                    state.content = (store.getState().EDITOR$HISTORY as any).present.content;
                    this.setState(state);
                }
                break;
        }

    }

    public insertContent(type: string, obj: any = {}): boolean {

        // 如果插入内容时，不是编辑模式的话，就提示警告
        if (!this.props.displayState) {
            new VMessageService('please switch to edit mode', 'warning').init();
            return false;
        }

        const state       = this.state;
        let returnContent = '';
        switch (type) {
            // 向编辑器插入图片
            case 'image':
                returnContent = this.editorTools.insertImage(obj.imageTitle, obj.imageUrl);
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;
            case 'fontBold':
                returnContent = this.editorTools.insertFontBold();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;
            case 'fontItalic':
                returnContent = this.editorTools.insertFontItalic();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;
            case 'fontStrikethrough':
                returnContent = this.editorTools.insertFontStrikethrough();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;
            case 'fontQuoteLeft':
                returnContent = this.editorTools.insertFontQuoteLeft();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;
        }
        if (state.content) {
            (this.textareaElement.current as HTMLTextAreaElement).dispatchEvent(new Event('textarea', {bubbles: true}));
            // this.textareaElement.dispatchEvent(event);
            this.writeArticleToStore(this.state.content);
        }
        return true;
    }

    public handelEditorTools(type: string) {
        switch (type) {
            case 'attached':
                this.attachedService.open();
                break;
            case 'fontBold':
                this.insertContent(type);
                break;
            case 'fontItalic':
                this.insertContent(type);
                break;
            case 'fontStrikethrough':
                this.insertContent(type);
                break;
            case 'fontQuoteLeft':
                this.insertContent(type);
                break;
        }
    }

    // 表单修改时的数据同步
    public handelEditor(event: React.ChangeEvent<HTMLTextAreaElement>) {

        const contentValue = event.target.value;

        const state   = this.state;
        state.content = contentValue;
        this.setState(state);

        this.writeArticleToStore(contentValue);

    }

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

            store.dispatch({
                type    : 'EDITOR$ADD',
                playload: {content}
            });

            clearTimeout(this.handelEditorTimer);
        }, 200);
    }

    public componentWillUnmount() {
        console.log('////componentWillUnmount');
    }


    public render() {

        return (
            <div className="wrap edit-mod" style={{display: this.props.displayState ? 'block' : 'none'}}>
                <div className="editor-container">
                    <textarea
                        ref={this.textareaElement}
                        name="content"
                        placeholder="write your dreams..."
                        value={this.state.content}
                        onChange={this.handelEditor}
                    />
                    <div className="editor-tools-bar">
                        {/*<span><FontAwesomeIcon icon="link"/></span>*/}
                        <span onClick={this.handelEditorTools.bind(this, 'fontItalic')}><FontAwesomeIcon icon="italic"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'fontBold')}><FontAwesomeIcon icon="bold"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'fontStrikethrough')}><FontAwesomeIcon icon="strikethrough"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'fontQuoteLeft')}><FontAwesomeIcon icon="quote-left"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'attached')}><FontAwesomeIcon icon="image"/></span>
                    </div>
                </div>
            </div>
        )
    }
}

export default connect<{}, {}, DefaultProps>((state: any) => state)(EditorComponent);