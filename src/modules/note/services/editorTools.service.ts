import {VMessageService} from "../../component/message";

export class EditorToolsService {

    public element: any;

    constructor(element: HTMLTextAreaElement) {
        this.element = element;
    }

    // 设置光标位置
    public setCaretPosition(pos: number) {
        if (this.element.setSelectionRange) {
            this.element.focus();
            setTimeout(() => {
                this.element.setSelectionRange(pos, pos);
            }, 0)

        }
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
    public insertImage(imageTitle: string, imageUrl: string): string {
        const sourceValue = this.element.value;
        const selection   = this.getTextAreaSelection();
        const tpl         = `\n![${imageTitle}](${imageUrl})\n`;
        const startValue  = sourceValue.substring(0, selection.start);
        const endValue    = sourceValue.substring(selection.end, selection.maxLength);
        this.setCaretPosition(selection.start);
        return startValue + tpl + endValue;
    }

    public insertFontBold(): string {
        const sourceValue = this.element.value;
        const selection   = this.getTextAreaSelection();
        if (selection.selectedLength > 0) {

            const selectedCont = selection.text.split('\n');
            const symbol       = '**';

            let newSelectedCont = '';
            if (selectedCont.length > 1) {
                selectedCont.forEach((item: any) => {
                    newSelectedCont += `${symbol}${item}${symbol}\n`;
                });
            } else {
                newSelectedCont = `${symbol}${selection.text}${symbol}`;
            }

            const startValue = sourceValue.substring(0, selection.start);
            const endValue   = sourceValue.substring(selection.end, selection.maxLength);
            this.setCaretPosition(selection.start);
            return `${startValue}${newSelectedCont}${endValue}`;
        } else {
            this.setCaretPosition(selection.start);
            new VMessageService('please select a text', 'warning').init();
            return '';
        }
    }

    public insertFontItalic(): string {
        const sourceValue = this.element.value;
        const selection   = this.getTextAreaSelection();
        if (selection.selectedLength > 0) {

            const selectedCont = selection.text.split('\n');
            const symbol       = '*';

            let newSelectedCont = '';
            if (selectedCont.length > 1) {
                selectedCont.forEach((item: any) => {
                    newSelectedCont += `${symbol}${item}${symbol}\n`;
                });
            } else {
                newSelectedCont = `${symbol}${selection.text}${symbol}`;
            }

            const startValue = sourceValue.substring(0, selection.start);
            const endValue   = sourceValue.substring(selection.end, selection.maxLength);
            this.setCaretPosition(selection.start);
            return `${startValue}${newSelectedCont}${endValue}`;
        } else {
            this.setCaretPosition(selection.start);
            new VMessageService('please select a text', 'warning').init();
            return '';
        }
    }

    public insertFontStrikethrough(): string {
        const sourceValue = this.element.value;
        const selection   = this.getTextAreaSelection();
        if (selection.selectedLength > 0) {

            const selectedCont = selection.text.split('\n');
            const symbol       = '~~';

            let newSelectedCont = '';
            if (selectedCont.length > 1) {
                selectedCont.forEach((item: any) => {
                    newSelectedCont += `${symbol}${item}${symbol}\n`;
                });
            } else {
                newSelectedCont = `${symbol}${selection.text}${symbol}`;
            }

            const startValue = sourceValue.substring(0, selection.start);
            const endValue   = sourceValue.substring(selection.end, selection.maxLength);
            this.setCaretPosition(selection.start);
            return `${startValue}${newSelectedCont}${endValue}`;
        } else {
            this.setCaretPosition(selection.start);
            new VMessageService('please select a text', 'warning').init();
            return '';
        }
    }

    public insertFontQuoteLeft(): string {
        const sourceValue  = this.element.value;
        const selection    = this.getTextAreaSelection();
        const selectedCont = selection.text.split('\n');
        const symbol       = '>';

        let newSelectedCont = '';
        if (selectedCont.length > 1) {
            selectedCont.forEach((item: any) => {
                newSelectedCont += `${symbol}${item}\n`;
            });
        } else {
            if (selection.start === 0) {
                newSelectedCont = `${symbol}${selection.text}`;
            } else {
                newSelectedCont = `\n${symbol}${selection.text}`;
            }
        }

        const startValue = sourceValue.substring(0, selection.start);
        const endValue   = sourceValue.substring(selection.end, selection.maxLength);
        this.setCaretPosition(selection.start);
        return `${startValue}${newSelectedCont}${endValue}`;
    }

}