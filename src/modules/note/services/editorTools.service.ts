export class EditorToolsService {

    public element: any;

    constructor(element: HTMLTextAreaElement) {
        this.element = element;
    }

    // 获取当前鼠标位置的相关信息
    public getTextAreaSelection() {
        const start   = this.element.selectionStart;
        const end     = this.element.selectionEnd;
        const context = this.element.value;
        return {
            start,
            end,
            text          : context.substring(start, end),
            selectedLength: end - start,
            maxLength     : context.length

        };
    }

    // 插入图片
    public insertImage(imageTitle: string, imageUrl: string) {
        const sourceValue = this.element.value;
        const selection   = this.getTextAreaSelection();
        const tpl         = `\n![${imageTitle}](${imageUrl})\n`;
        const startValue  = sourceValue.substring(0, selection.start);
        const endValue    = sourceValue.substring(selection.end, selection.maxLength);
        return startValue + tpl + endValue;
    }

}