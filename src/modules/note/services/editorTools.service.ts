import {VMessageService} from "../../component/message";

export class EditorToolsService {

    public element: any;

    constructor(element: HTMLTextAreaElement) {
        this.element = element;
    }

    // 设置光标位置
    public setCaretPosition(startPos: number, endPos?: number, autoFocus = true) {
        if (this.element.setSelectionRange) {
            setTimeout(() => {
                if (autoFocus) {
                    this.element.focus();
                }
                this.element.setSelectionRange(startPos, endPos ? endPos : startPos);
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
        this.setCaretPosition(selection.start + tpl.length);
        return startValue + tpl + endValue;
    }

    // 插入粗体
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
            this.setCaretPosition(selection.start + newSelectedCont.length);
            return `${startValue}${newSelectedCont}${endValue}`;
        } else {
            this.setCaretPosition(selection.start);
            new VMessageService('please select a ttext', 'warning').init();
            return '';
        }
    }

    // 插入斜体
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
            this.setCaretPosition(selection.start + newSelectedCont.length);
            return `${startValue}${newSelectedCont}${endValue}`;
        } else {
            this.setCaretPosition(selection.start);
            new VMessageService('please select a text', 'warning').init();
            return '';
        }
    }

    // 插入贯穿线
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
            this.setCaretPosition(selection.start + newSelectedCont.length);
            return `${startValue}${newSelectedCont}${endValue}`;
        } else {
            this.setCaretPosition(selection.start);
            new VMessageService('please select a text', 'warning').init();
            return '';
        }
    }

    // 插入引用
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
        this.setCaretPosition(selection.start + newSelectedCont.length);
        return `${startValue}${newSelectedCont}${endValue}`;
    }

    // 插入超级链接
    public insertSuperLink(): string {
        const sourceValue   = this.element.value;
        const selection     = this.getTextAreaSelection();
        const startValue    = sourceValue.substring(0, selection.start);
        const endValue      = sourceValue.substring(selection.end, selection.maxLength);
        const title         = selection.text;
        let newSelectedCont = '';
        if (selection.selectedLength > 0) {
            newSelectedCont = `[${title}](http://link.com)`;
        } else {
            newSelectedCont = `[title](http://link.com)`;
        }
        this.setCaretPosition(selection.start + newSelectedCont.length);
        return `${startValue}${newSelectedCont}${endValue}`
    }

    // 插入缩进
    public insertIncreaseIndent(): string {
        const sourceValue   = this.element.value;
        const selection     = this.getTextAreaSelection();
        const startValue    = sourceValue.substring(0, selection.start);
        const endValue      = sourceValue.substring(selection.end, selection.maxLength);
        let newSelectedCont = '';
        const tab           = ' '.repeat(4);
        const lineBreak     = '\n';

        // 选中内容时进行缩进
        if (selection.text) {

            // 选中了多行
            if (selection.text.indexOf(lineBreak) > 0 && selection.text.split(lineBreak).length > 1) {
                const texts = selection.text.split(lineBreak);
                texts.forEach((item: string, index: number) => {
                    texts[index] = tab + item;
                });
                newSelectedCont         = texts.join(lineBreak);
                let afterSelectionStart = selection.start;
                afterSelectionStart     = afterSelectionStart <= 0 ? 0 : afterSelectionStart;
                const afterSelectionEnd = selection.end + tab.length * texts.length;

                this.setCaretPosition(afterSelectionStart, afterSelectionEnd, false);
            }
            // 选中了单行
            else {
                newSelectedCont         = tab + selection.text;
                let afterSelectionStart = selection.start;
                afterSelectionStart     = afterSelectionStart <= 0 ? 0 : afterSelectionStart;
                const afterSelectionEnd = selection.end + tab.length;
                this.setCaretPosition(afterSelectionStart, afterSelectionEnd, false);
            }
        }

        // 未选中任何内容时，进行缩进
        if (!selection.text) {
            newSelectedCont = tab;
            this.setCaretPosition(selection.start + tab.length);
        }

        return `${startValue}${newSelectedCont}${endValue}`;
    }

    // 插入伸出
    public insertDecreaseIndent(): string {
        const sourceValue   = this.element.value;
        const selection     = this.getTextAreaSelection();
        const startValue    = sourceValue.substring(0, selection.start);
        const endValue      = sourceValue.substring(selection.end, selection.maxLength);
        let newSelectedCont = '';
        const space         = ' ';
        const tab           = space.repeat(4);
        const lineBreak     = '\n';

        // 选中内容时进行缩进
        if (selection.text) {

            // 选中了多行
            if (selection.text.indexOf(lineBreak) > 0 && selection.text.split(lineBreak).length > 1) {
                const texts   = selection.text.split(lineBreak);
                let postCount = 0;
                texts.forEach((item: string, index: number) => {
                    if (item.indexOf(tab) === 0) {
                        postCount++;
                        texts[index] = item.substr(tab.length, item.length);
                    }
                });
                newSelectedCont         = texts.join(lineBreak);
                let afterSelectionStart = selection.start;
                afterSelectionStart     = afterSelectionStart <= 0 ? 0 : afterSelectionStart;
                const afterSelectionEnd = selection.end - tab.length * postCount;
                this.setCaretPosition(afterSelectionStart, afterSelectionEnd, false);
            }
            // 选中了单行
            else {

                if (selection.text.indexOf(tab) === 0) {
                    newSelectedCont = selection.text;
                    newSelectedCont = newSelectedCont.substring(tab.length, newSelectedCont.length);
                    this.setCaretPosition(selection.start, selection.end - tab.length, false);
                } else {
                    newSelectedCont = selection.text;
                }
            }
        }

        return `${startValue}${newSelectedCont}${endValue}`;
    }

    // 插入换行回车
    public insertEnter(): string {
        const sourceValue   = this.element.value;
        const selection     = this.getTextAreaSelection();
        const startValue    = sourceValue.substring(0, selection.start);
        const endValue      = sourceValue.substring(selection.end, selection.maxLength);
        let newSelectedCont = '';
        const enter         = '\n';
        const space         = ' ';

        const tempSourceValue    = sourceValue.substring(0, selection.start).split(enter);
        const currentLineContent = tempSourceValue[tempSourceValue.length - 1];

        let spaceLen = 0;
        currentLineContent.replace(/( +)/, ($1: string) => {
            if ($1 && $1.length > 1) {
                spaceLen = $1.length;
            } else {
                spaceLen = 0;
            }
        });

        newSelectedCont = `${selection.text}${enter}${space.repeat(spaceLen)}`;
        this.setCaretPosition(selection.end + (spaceLen > 1 ? (spaceLen + enter.length) : 1));

        return `${startValue}${newSelectedCont}${endValue}`;
    }

}
