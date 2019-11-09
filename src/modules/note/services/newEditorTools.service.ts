import * as Monaco               from "monaco-editor";
import {editor, Position, Range} from "monaco-editor";

interface InsertConf {
    left?: string
    right?: string
    defaultContent?: string
}

interface SelectedMaps {
    start: number,
    end: number,
    content: string
}

export default class NewEditorToolsService {

    public monacoEditor: editor.IStandaloneCodeEditor;
    public insertConf: InsertConf;

    constructor(editorVm: editor.IStandaloneCodeEditor) {
        this.monacoEditor = editorVm;
    }

    // 获取当前光标信息
    public getEditorCursorPosInfo(): Position {
        return this.monacoEditor.getPosition() as Position;

    }

    // 获取选中的文本信息
    public getEditorSelectedInfo() {
        const selectionInfo              = this.monacoEditor.getSelection() as Range;
        const isMultipleRow              = selectionInfo.endLineNumber - selectionInfo.startLineNumber > 0;
        const isSelectedContent          = selectionInfo.endColumn - selectionInfo.startColumn > 0;
        const model: editor.ITextModel   = this.monacoEditor.getModel() as editor.ITextModel;
        const linesContent               = model.getLinesContent();
        const selectedMaps: SelectedMaps = {
            start  : 0,
            end    : 0,
            content: ''
        };

        // 选中了文本
        if (isSelectedContent) {

            // 选中多行
            if (isMultipleRow) {
                for (let i = selectionInfo.startLineNumber - 1; i < selectionInfo.endLineNumber; i++) {
                    const content       = linesContent[i];
                    selectedMaps[i + 1] = {
                        start: 0,
                        content,
                        end  : content.length
                    }
                }
            }
            // 选中单行
            else {
                const content                               = linesContent[selectionInfo.startLineNumber - 1];
                selectedMaps[selectionInfo.startLineNumber] = {
                    start: selectionInfo.startColumn,
                    content,
                    end  : selectionInfo.endColumn
                }
            }
        }
        // 未选中文本
        else {
            selectedMaps[selectionInfo.startLineNumber] = {
                start  : selectionInfo.startColumn,
                content: '',
                end    : selectionInfo.startColumn
            }
        }

        return {
            selectionInfo,
            isMultipleRow,
            isSelectedContent,
            selectedMaps
        }
    }

    // 设置光标信息
    public setEditorCursorPos() {
        //
    }

    // 设置选中的内容
    public setEditorValue(conf: InsertConf) {
        const {selectedMaps, selectionInfo, isMultipleRow, isSelectedContent} = this.getEditorSelectedInfo();
        const edits: any[]                                                    = [];

        // 选中文本时
        if (isSelectedContent) {
            // 多行处理
            if (isMultipleRow) {
                Object.keys(selectedMaps).map((key: string) => {

                    const index = Number(key);
                    const item  = selectedMaps[index];
                    if (item) {
                        const range         = new Monaco.Range(index, 0, index, item.end + 1);
                        const insertContent = `${conf.left || ''}${item.content || conf.defaultContent}${conf.right || ''}`;

                        if (item.content) {
                            edits.push({range, text: insertContent, forceMoveMarkers: true});
                        }
                    }
                });
            }
            // 单行处理
            else {

                const {startLineNumber, startColumn, endLineNumber, endColumn} = selectionInfo;

                const currentContent = selectedMaps[selectionInfo.startLineNumber];
                const subStart       = currentContent.start - 1;
                const subEnd         = currentContent.end - 1;
                const text           = currentContent.content.substring(subStart, subEnd) as string;
                const insertContent  = `${conf.left || ''}${text}${conf.right || ''}`;
                const range          = new Monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
                edits.push({range, text: insertContent, forceMoveMarkers: true});
            }


        }
        // 未选中任何文本时
        else {
            const {startLineNumber, startColumn, endLineNumber, endColumn} = selectionInfo;

            const insertContent = `${conf.left || ''}${conf.defaultContent}${conf.right || ''}`;
            const range         = new Monaco.Range(startLineNumber, startColumn, endLineNumber, endColumn);
            edits.push({range, text: insertContent, forceMoveMarkers: true});
        }

        this.monacoEditor.executeEdits("", edits);
    }

    // 插入斜体
    public fontItalic() {
        this.insertConf = {left: '*', right: '*', defaultContent: 'text'};
        this.setEditorValue(this.insertConf);
    }

    // 插入粗体
    public fontBold() {
        const symbol = {left: '**', right: '**', defaultContent: 'text'};
        this.setEditorValue(symbol);
    }

    // 插入贯穿线
    public fontStrikethrough() {
        this.insertConf = {left: '~~', right: '~~', defaultContent: 'text'};
        this.setEditorValue(this.insertConf);
    }

    // 插入引用
    public fontQuoteLeft() {
        this.insertConf = {left: '>', defaultContent: 'text'};
        this.setEditorValue(this.insertConf);
    }

    // 插入超链接
    public superLink() {
        this.insertConf = {left: '[', right: '](http://link.com)', defaultContent: 'url title'};
        this.setEditorValue(this.insertConf);
    }

    // 插入图片
    public image(data: any) {
        console.log(data);

        // `\n![${imageTitle}](${imageUrl})\n`
        this.insertConf = {left: '![', right: `](${data.imageUrl})`, defaultContent: data.imageTitle};
        this.setEditorValue(this.insertConf);
    }

}
