import * as CodeMirror from "codemirror";

export class EditorToolsService {

    public editor: any;

    constructor(Editor: any) {
        this.editor = Editor;
    }

    public insertImage(imageTitle: string, imageUrl: string) {

        const imageKey = new Date().getTime();
        const tpl1     = `![${imageTitle}][${imageKey}]\n`;
        const tpl2     = `\n\n[${imageKey}]: ${imageUrl}  "${imageTitle}"`;

        this.editor.replaceSelection(tpl1);
        this.editor.replaceRange(tpl2, CodeMirror.Pos(this.editor.lastLine()));
    }

}