import {Service}         from "../../../lib/master.electron.lib";
import {VMessageService} from "../../component/message";
import {store}           from "../../../store";

export class ArticleService {

    public async createdNote(cid: number): Promise<boolean> {

        let postfix        = new Date().getTime() + '';
        postfix            = postfix.substring(postfix.length - 4, postfix.length);
        const name: string = 'temp' + postfix;

        const noteBody = {
            title           : name,
            cid,
            markdown_content: 'markdown balabala',
            html_content    : 'html balabala'
        };

        const request = await new Service.ServerProxy('note', 'addArticleData', noteBody).send();
        return request.result !== 1;
    }

    public async saveNote(): Promise<boolean | void> {
        const ARTICLE      = (store.getState() as any).STORE_NOTE$ARTICLE;
        const ARTICLE_TEMP = (store.getState() as any).STORE_NOTE$ARTICLE_TEMP;

        if (!ARTICLE_TEMP.title) {
            new VMessageService('the title can not be blank!', 'warning').init();
            return false;
        }

        if (!ARTICLE_TEMP.markdown_content) {
            new VMessageService('the content can not be blank!', 'warning').init();
            return false;
        }

        if (ARTICLE.title === ARTICLE_TEMP.title && ARTICLE.markdown_content === ARTICLE_TEMP.markdown_content) {
            new VMessageService('no changes, no need to save', 'common').init();
            return false;
        }

        const updateContentBody = {
            id              : ARTICLE.id,
            title           : ARTICLE_TEMP.title,
            markdown_content: ARTICLE_TEMP.markdown_content
        };

        const request = await new Service.ServerProxy('note', 'updateArticleData', updateContentBody).send();

        if (request.result !== 1) {

            new VMessageService('note update success!', 'success').init();

            store.dispatch({
                type    : 'NOTE$UPDATE_ARTICLE',
                playload: {
                    id              : ARTICLE.id,
                    cid             : ARTICLE.cid,
                    lock            : ARTICLE.lock,
                    title           : ARTICLE_TEMP.title,
                    markdown_content: ARTICLE_TEMP.markdown_content,
                    html_content    : ARTICLE_TEMP.html_content
                }
            });

            store.dispatch({
                type: 'NOTE$SAVE_ARTICLE'
            });

        }
    }

}