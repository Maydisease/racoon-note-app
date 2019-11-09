import {VMessageService}  from "../../component/message";
import {store}            from "../../../store";
import {request}          from "./requst.service";
import * as MarkdownIt    from "markdown-it";

const markdownItImsize = require('markdown-it-imsize');
import markdownItToDoList from "../../../lib/plugins/markdown_it/toDoList";
import markdownItMermaid  from "../../../lib/plugins/markdown_it/mermaid";

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

declare var Prism: any;

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

        const response = await request('note', 'addArticleData', noteBody);
        return response.result !== 1;
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

        const response = await request('note', 'updateArticleData', updateContentBody);

        if (response.result !== 1) {

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

    public handlesMarkdownToHtml(markdownContent: string): string {
        const markdownIt = new MarkdownIt({
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
        });

        markdownIt
            .use(markdownItImsize)
            .use(markdownItToDoList)
            .use(markdownItMermaid);

        return markdownIt.render(markdownContent);
    }

}
