export class EditorToolsService {

    public editor: any;

    constructor(Editor: any) {
        this.editor = Editor;
    }

    public insertImage(imageTitle: string, imageUrl: string) {

        const tpl = `\n![${imageTitle}](${imageUrl})\n`;
        this.editor.replaceSelection(tpl);

        // insert Last
        // this.editor.replaceRange(tpl2, CodeMirror.Pos(this.editor.lastLine()));
    }

}