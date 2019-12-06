import * as React       from 'react';
import './monaco.scss';
import * as Monaco      from "monaco-editor/esm/vs/editor/editor.api";
import {editor}         from "monaco-editor";
import {connect}        from "react-redux";
import {store}          from "../../../../store";
import * as editorConf  from './config.json';
import Toolbox          from '../toolbox';
import {ArticleService} from '../../../note/services/article.service';
import DropZone         from "../../drop_zone";
import {storeSubscribe} from "../../../../store/middleware/storeActionEvent.middleware";

interface Props {
    input: {
        content: string
    },
    STORE_NOTE$ARTICLE_TEMP: {
        markdown_content: string,
        html_content: string,
        title: string
    }
}

class EditorMonaco extends React.Component {

    public state: any = {
        isDragging: false
    };

    public monacoEditorContainer: React.RefObject<HTMLDivElement>;
    public monacoEditor: editor.IStandaloneCodeEditor;
    public props: Props;
    public isInitEditorValue: boolean;
    public currentArticleId: number;
    public articleService: ArticleService;
    public changeContentTimer: number;
    public changeContentIntervalTime: number;
    public monacoEditorTempValue: string;

    constructor(props: any) {
        super(props);
        this.changeContentIntervalTime = 400;
        this.articleService            = new ArticleService();
        this.monacoEditorContainer     = React.createRef();
        this.setEditorValue            = this.setEditorValue.bind(this);
        this.editorInit                = this.editorInit.bind(this);
    }

    public shouldComponentUpdate(nextProps: Readonly<object>): boolean {
        return true;
    }

    public componentDidUpdate($prevProps: Readonly<object>): void {
        const prevProps: any = $prevProps;
        const article        = prevProps.STORE_NOTE$ARTICLE;
        this.setEditorValue(article.id, article.markdown_content);
    }

    public writeTempArticleStore() {
        const newHtmlContent = this.articleService.handlesMarkdownToHtml(this.monacoEditorTempValue);
        store.dispatch({
            type    : 'NOTE$UPDATE_ARTICLE_TEMP',
            playload: {
                title           : (this.props as any).STORE_NOTE$ARTICLE_TEMP.title,
                markdown_content: this.monacoEditorTempValue,
                html_content    : newHtmlContent
            }
        });
    }

    public updateArticleStore(immediatelyUpdate: boolean = false): boolean | void {
        // 清除已有的定时器
        if (this.changeContentTimer) {
            clearTimeout(this.changeContentTimer);
        }
        // 如果需要立即更新的话
        if (immediatelyUpdate) {
            this.writeTempArticleStore();
            return false;
        }
        // 正常逻辑的更新
        this.changeContentTimer = window.setTimeout(() => {
            this.writeTempArticleStore();
        }, this.changeContentIntervalTime);
    }

    // 设置编辑器的认值
    public setEditorValue(articleId: number, markdownContent: string) {

        if (this.currentArticleId !== articleId) {
            this.currentArticleId  = articleId;
            this.isInitEditorValue = false;
        }

        if (this.monacoEditor && this.monacoEditor.setValue && !this.isInitEditorValue) {
            this.isInitEditorValue = true;
            this.currentArticleId  = articleId;
            try {
                this.monacoEditor.setValue(markdownContent);
            } catch (e) {
                //
            }
        }
    }

    // 编辑器初始化
    public editorInit() {
        const editorContainer = this.monacoEditorContainer.current as HTMLElement;
        if (!this.monacoEditor) {
            this.monacoEditor = Monaco.editor.create(editorContainer, editorConf);

            // 当编辑器内的markdown内容有更新后
            this.monacoEditor.onDidChangeModelContent((event: any) => {
                this.monacoEditorTempValue = this.monacoEditor.getValue();
                this.updateArticleStore();
            })

        }

        storeSubscribe('WINDOW_KEYBOARD$CMD_OR_CTRL_S', async () => {
            const editMode = store.getState().STORE_NOTE$FRAME.editMode;
            if (editMode) {
                this.updateArticleStore(true);
                await new ArticleService().saveNote();
            }
        });
    }

    public handelDropFiles(files: any) {
        //
    }

    public componentDidMount() {
        this.editorInit();
    }

    public componentWillUnmount(): void {
        this.monacoEditor.dispose();
    }

    public render() {
        return (
            <div className="editor-wrap">
                <DropZone
                    dropFiles={this.handelDropFiles}
                >
                    <div
                        ref={this.monacoEditorContainer}
                        className={`editor-container-monaco ${this.state.isDragging ? 'drag' : ''}`}
                    />
                </DropZone>
                <Toolbox editorVm={this.monacoEditor}/>
            </div>
        )
    }
}

export default connect<{}, {}, any>((state: any) => state)(EditorMonaco);
