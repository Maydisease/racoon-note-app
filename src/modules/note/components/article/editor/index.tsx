import * as React                          from 'react';
import {connect}                           from 'react-redux';
import {store}                             from "../../../../../store";
import * as MarkdownIt                     from 'markdown-it';
import {EditorToolsService}                from '../../../services/editorTools.service';
import {Service}                           from "../../../../../lib/master.electron.lib";
import markdownItMermaid                   from "../../../../../lib/plugins/markdown_it/mermaid";
import markdownItToDoList                  from "../../../../../lib/plugins/markdown_it/toDoList";
import {ArticleService}                    from "../../../services/article.service";
import {FontAwesomeIcon}                   from "@fortawesome/react-fontawesome";
import {$AttachedService, AttachedService} from '../../../services/window_manage/attached.server';
import {VMessageService}                   from "../../../../component/message";
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
        this.insertContent       = this.insertContent.bind(this);
        this.handelEditorTools   = this.handelEditorTools.bind(this);
        this.handelEditor        = this.handelEditor.bind(this);
        this.handelEditorKeyDown = this.handelEditorKeyDown.bind(this);
        this.writeArticleToStore = this.writeArticleToStore.bind(this);
        this.superLinkConfirm    = this.superLinkConfirm.bind(this);
        this.superLinkCancel     = this.superLinkCancel.bind(this);
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

            const textAreaSelection = this.editorTools.getTextAreaSelection();
            let textAreaCursor      = 0;
            if (textAreaSelection.start === textAreaSelection.end) {
                textAreaCursor = textAreaSelection.start;
            } else {
                textAreaCursor = textAreaSelection.end;
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

        Service.RenderToRender.subject('attached@editorInsertImage', async (event: any, params: any): Promise<boolean | void> => {
            this.insertContent('image', params.data);
        });

    }

    public contentUndoOrRedo(type: string): void {

        const timeShuttle = () => {
            store.dispatch({type});
            const history = store.getState().EDITOR$HISTORY;
            this.editorTools.setCaretPosition(history.present.cursor);
            store.dispatch({
                type    : 'NOTE$UPDATE_ARTICLE_TEMP',
                playload: {
                    title           : (this.props as any).STORE_NOTE$ARTICLE_TEMP.title,
                    markdown_content: history.present.content,
                    html_content    : (this.markdownIt.render(history.present.content) as string)
                }
            });
            const state   = this.state;
            state.content = history.present.content;
            this.setState(state);
        };

        switch (type) {
            case 'UNDO':
                if (store.getState().EDITOR$HISTORY.past.length > 1) {
                    timeShuttle();
                }
                break;
            case 'REDO':
                if (store.getState().EDITOR$HISTORY.future.length > 0) {
                    timeShuttle();
                }
                break;
        }

    }

    public insertSuperLink() {
        const state                 = this.state;
        state.superLinkPanel.status = !this.state.superLinkPanel.status;
        this.setState(state);
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
            case  'insertSuperLink':
                returnContent = this.editorTools.insertSuperLink();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;
            case  'insertIncreaseIndent':
                returnContent = this.editorTools.insertIncreaseIndent();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;

            case  'insertDecreaseIndent':
                returnContent = this.editorTools.insertDecreaseIndent();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;

            case  'insertEnter':
                returnContent = this.editorTools.insertEnter();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;

            case  'insertSelectedLine':
                returnContent = this.editorTools.insertSelectedLine();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;

            case  'insertCloneLine':
                returnContent = this.editorTools.insertCloneLine();
                if (returnContent) {
                    state.content = returnContent;
                    this.setState(state);
                }
                break;

        }
        if (state.content) {
            (this.textareaElement.current as HTMLTextAreaElement).dispatchEvent(new Event('textarea', {bubbles: true}));
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
            case 'insertSuperLink':
                this.insertContent(type);
                break;
            case 'insertIncreaseIndent':
                this.insertContent(type);
                break;
            case 'insertDecreaseIndent':
                this.insertContent(type);
                break;
            case 'insertEnter':
                this.insertContent(type);
                break;
            case 'insertSelectedLine':
                this.insertContent(type);
                break;
            case 'insertCloneLine':
                this.insertContent(type);
                break;
            case 'undo':
                this.contentUndoOrRedo('UNDO');
                break;
            case 'redo':
                this.contentUndoOrRedo('REDO');
                break;


        }
    }

    // 表单修改时的数据同步
    public handelEditor(event: React.ChangeEvent<HTMLTextAreaElement>) {

        const contentValue = event.target.value;
        const state        = this.state;
        state.content      = contentValue;
        this.setState(state);
        this.writeArticleToStore(contentValue);
    }

    public handelEditorKeyDown(event: KeyboardEventInit) {

        // 缩进
        if (event.key === 'Tab' && !event.shiftKey) {
            this.handelEditorTools('insertIncreaseIndent');
            (event as any).preventDefault();
        }

        // 伸出
        if (event.key === 'Tab' && event.shiftKey) {
            this.handelEditorTools('insertDecreaseIndent');
            (event as any).preventDefault();
        }

        // 换行
        if (event.key === 'Enter') {
            this.handelEditorTools('insertEnter');
            (event as any).preventDefault();
        }

        // 选中整行
        if (event.key === 'Home' && event.shiftKey) {
            this.handelEditorTools('insertSelectedLine');
            (event as any).preventDefault();
        }

        // 克隆当前行
        if (event.key === 'd' && event.metaKey) {
            this.handelEditorTools('insertCloneLine');
            (event as any).preventDefault();
        }

        // 撤消
        if (event.key === 'z' && event.metaKey) {
            this.handelEditorTools('undo');
            (event as any).preventDefault();
        }

        // 重做
        if (event.key === 'z' && event.shiftKey && event.metaKey) {
            this.handelEditorTools('redo');
            (event as any).preventDefault();
        }

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

            const textAreaSelection = this.editorTools.getTextAreaSelection();
            let textAreaCursor      = 0;
            if (textAreaSelection.start === textAreaSelection.end) {
                textAreaCursor = textAreaSelection.start;
            } else {
                textAreaCursor = textAreaSelection.end;
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

    public superLinkConfirm(title: string, link: string) {
        const state                 = this.state;
        state.superLinkPanel.status = false;
        this.setState(state);
    }

    public superLinkCancel() {
        const state                 = this.state;
        state.superLinkPanel.status = false;
        this.setState(state);
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
                        onKeyDown={this.handelEditorKeyDown}
                        onChange={this.handelEditor}
                    />
                    <div className="editor-tools-bar">
                        {/*<span><FontAwesomeIcon icon="link"/></span>*/}
                        <span onClick={this.handelEditorTools.bind(this, 'fontItalic')}><FontAwesomeIcon icon="italic"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'fontBold')}><FontAwesomeIcon icon="bold"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'fontStrikethrough')}><FontAwesomeIcon icon="strikethrough"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'fontQuoteLeft')}><FontAwesomeIcon icon="quote-left"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'attached')}><FontAwesomeIcon icon="image"/></span>
                        <span onClick={this.handelEditorTools.bind(this, 'insertSuperLink')}><FontAwesomeIcon icon="link"/></span>
                    </div>
                </div>
                <div className="dialog-tools">
                    {/*{*/}
                    {/*    this.state.superLinkPanel.status &&*/}
                    {/*	<SuperLinkComponent*/}
                    {/*		selectedTitle={this.state.superLinkPanel.title}*/}
                    {/*		mod={this.props.displayState}*/}
                    {/*		handleConfirm={this.superLinkConfirm}*/}
                    {/*		handelCancel={this.superLinkCancel}*/}
                    {/*	/>*/}
                    {/*}*/}
                </div>
            </div>
        )
    }
}

export default connect<{}, {}, DefaultProps>((state: any) => state)(EditorComponent);
