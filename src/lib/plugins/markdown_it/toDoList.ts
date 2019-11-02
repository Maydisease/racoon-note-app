import * as MarkdownIt from 'markdown-it';

interface GetTodoObjectResult {
    name: string
    state: boolean
    content: string
}

type GetTodoObject = (str: string) => GetTodoObjectResult

const ToDoListPlugin = (md: MarkdownIt) => {

    const getTodoObject: GetTodoObject = (str) => {
        const space = ' ';

        const map = {
            [`[ ]${space}`]: {name: 'undone', icon: '💡'},
            [`[o]${space}`]: {name: 'done', icon: '✅️'},
            [`[x]${space}`]: {name: 'cancel', icon: '❌'}
        };

        let result: GetTodoObjectResult = {
            name   : '',
            state  : false,
            content: ''
        };

        Object.keys(map).some(($item: string) => {
            if (str && str.indexOf($item) === 0) {
                result = {
                    name   : map[$item].name,
                    state  : true,
                    content: `${map[$item].icon}${str.substring($item.length, str.length)}`
                };
            }
        });
        return result;
    };

    md.inline.ruler2.before('emphasis', 'toDo', (state: any) => {
        if (state.tokens && typeof state.tokens === 'object' && state.tokens.length > 0) {

            const len = state.tokens.length;

            for (let i = 0; i < len; i++) {
                for (let $i = 0; $i < state.tokens.length; $i++) {
                    const todoObject        = getTodoObject(state.tokens[$i].content);
                    const isIncludeTodoType = todoObject.state;
                    if (state.tokens[$i].type === 'text' && isIncludeTodoType) {

                        const prevToken = {
                            attrs  : [['class', `toDo-item ${todoObject.name}`]],
                            type   : 'span_open',
                            tag    : 'span',
                            nesting: 1,
                            markup : '',
                            content: ''
                        };

                        const currentTokenContent = `${todoObject.content}`;

                        const nextToken = {
                            attrs  : '',
                            type   : 'span_close',
                            tag    : 'span',
                            nesting: -1,
                            markup : '',
                            content: ''
                        };

                        if ($i === 0) {
                            state.tokens.unshift(prevToken);
                            state.tokens[$i + 1].content = currentTokenContent;
                            state.tokens.splice($i + 2, 0, nextToken);
                        } else if ($i === len) {
                            state.tokens.splice($i - 1, 0, prevToken);
                            state.tokens[$i + 1].content = currentTokenContent;
                            state.tokens.push(nextToken);
                        } else {
                            state.tokens.splice($i, 0, prevToken);
                            state.tokens[$i + 1].content = currentTokenContent;
                            state.tokens.splice($i + 2, 0, nextToken);
                        }
                    }
                }
            }
        }
    });
};

export default ToDoListPlugin;
